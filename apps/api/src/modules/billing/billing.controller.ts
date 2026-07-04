import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  UseGuards,
  ForbiddenException,
  RawBodyRequest,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SkipTrialCheck } from '../auth/decorators/skip-trial-check.decorator';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

class CreateCheckoutDto {
  @ApiProperty({ enum: ['STARTER', 'PROFESSIONAL'] })
  @IsIn(['STARTER', 'PROFESSIONAL'])
  @IsNotEmpty()
  tier: 'STARTER' | 'PROFESSIONAL';
}

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  // Expired-trial practices must be able to reach this — that's who's subscribing
  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @SkipTrialCheck()
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 900000 } })
  @ApiOperation({ summary: 'Create a Stripe Checkout session for this practice' })
  async createCheckout(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCheckoutDto,
  ) {
    if (req.user.role !== 'PRACTICE_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only practice administrators can manage billing');
    }
    return this.billingService.createCheckoutSession(req.user.practiceId, dto.tier);
  }

  // Called by Stripe, authenticated via webhook signature — not JWT
  @Post('webhook')
  @SkipTrialCheck()
  @ApiOperation({ summary: 'Stripe webhook endpoint (signature-verified)' })
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody) {
      throw new ForbiddenException('Missing request body');
    }
    return this.billingService.handleWebhook(req.rawBody, signature);
  }
}
