import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../prisma/prisma.service';
import { TIER_KEY } from '../decorators/tier.decorator';

@Injectable()
export class TierGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredTiers = this.reflector.getAllAndOverride<string[]>(TIER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No tier requirement = allow all
    if (!requiredTiers || requiredTiers.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Super admin can access everything
    if (user.role === 'SUPER_ADMIN' || user.isSuperAdmin) {
      return true;
    }

    if (!user.practiceId) {
      throw new ForbiddenException('No practice associated with this account.');
    }

    const practice = await this.prisma.practice.findUnique({
      where: { id: user.practiceId },
      select: { subscriptionTier: true },
    });

    if (!practice) {
      throw new ForbiddenException('Practice not found.');
    }

    if (!requiredTiers.includes(practice.subscriptionTier)) {
      throw new ForbiddenException(
        `This feature requires a ${requiredTiers.join(' or ')} plan. Your current plan is ${practice.subscriptionTier}. Please upgrade to access this feature.`,
      );
    }

    return true;
  }
}
