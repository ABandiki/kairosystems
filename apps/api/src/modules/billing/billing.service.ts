import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import Stripe = require('stripe');
import { PrismaService } from '../../prisma/prisma.service';

type PaidTier = 'STARTER' | 'PROFESSIONAL';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private stripe: Stripe | null = null;

  constructor(private prisma: PrismaService) {
    if (process.env.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
  }

  private getStripe(): Stripe {
    if (!this.stripe) {
      throw new BadRequestException('Billing is not configured');
    }
    return this.stripe;
  }

  private priceIdFor(tier: PaidTier): string {
    const priceId =
      tier === 'STARTER'
        ? process.env.STRIPE_PRICE_STARTER
        : process.env.STRIPE_PRICE_PROFESSIONAL;
    if (!priceId) {
      throw new BadRequestException(`No price configured for ${tier}`);
    }
    return priceId;
  }

  /** Create a Stripe Checkout session so a practice admin can subscribe. */
  async createCheckoutSession(practiceId: string, tier: PaidTier) {
    const stripe = this.getStripe();

    const practice = await this.prisma.practice.findUnique({
      where: { id: practiceId },
      select: { id: true, name: true, email: true, stripeCustomerId: true },
    });
    if (!practice) {
      throw new NotFoundException('Practice not found');
    }

    // Reuse the Stripe customer across sessions so subscriptions stay linked
    let customerId = practice.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: practice.name,
        email: practice.email,
        metadata: { practiceId: practice.id },
      });
      customerId = customer.id;
      await this.prisma.practice.update({
        where: { id: practice.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: this.priceIdFor(tier), quantity: 1 }],
      subscription_data: {
        metadata: { practiceId: practice.id, tier },
      },
      metadata: { practiceId: practice.id, tier },
      success_url: `${appUrl}/dashboard?billing=success`,
      cancel_url: `${appUrl}/dashboard?billing=cancelled`,
      allow_promotion_codes: true,
    });

    return { url: session.url };
  }

  /** Verify and handle Stripe webhook events. */
  async handleWebhook(rawBody: Buffer, signature: string) {
    const stripe = this.getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      this.logger.warn(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.activateSubscription(
          session.metadata?.practiceId,
          (session.metadata?.tier as PaidTier) || 'STARTER',
          session.subscription as string,
        );
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await this.syncSubscription(sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await this.endSubscription(sub);
        break;
      }
      default:
        this.logger.debug(`Unhandled webhook event: ${event.type}`);
    }

    return { received: true };
  }

  private async activateSubscription(
    practiceId: string | undefined,
    tier: PaidTier,
    subscriptionId: string | null,
  ) {
    if (!practiceId) {
      this.logger.warn('checkout.session.completed without practiceId metadata');
      return;
    }

    await this.prisma.practice.update({
      where: { id: practiceId },
      data: {
        isTrial: false,
        trialEndsAt: null,
        isActive: true,
        subscriptionTier: tier,
        maxStaffIncluded: tier === 'PROFESSIONAL' ? 10 : 3,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: null,
        ...(subscriptionId && { stripeSubscriptionId: subscriptionId }),
      },
    });
    this.logger.log(`Subscription activated: practice=${practiceId} tier=${tier}`);
  }

  private async syncSubscription(sub: Stripe.Subscription) {
    const practiceId = sub.metadata?.practiceId;
    if (!practiceId) return;

    // Reflect Stripe state: active/trialing keeps access; period end mirrors renewal
    const isHealthy = ['active', 'trialing', 'past_due'].includes(sub.status);
    const periodEnd = sub.items?.data?.[0]?.current_period_end;

    await this.prisma.practice.update({
      where: { id: practiceId },
      data: {
        stripeSubscriptionId: sub.id,
        ...(isHealthy && { isTrial: false }),
        subscriptionEndDate: periodEnd ? new Date(periodEnd * 1000) : undefined,
      },
    });
    this.logger.log(`Subscription synced: practice=${practiceId} status=${sub.status}`);
  }

  private async endSubscription(sub: Stripe.Subscription) {
    const practiceId = sub.metadata?.practiceId;
    if (!practiceId) return;

    // Put the practice back on an expired trial so access locks until they resubscribe
    await this.prisma.practice.update({
      where: { id: practiceId },
      data: {
        stripeSubscriptionId: null,
        isTrial: true,
        trialEndsAt: new Date(),
        subscriptionEndDate: new Date(),
      },
    });
    this.logger.log(`Subscription ended: practice=${practiceId}`);
  }
}
