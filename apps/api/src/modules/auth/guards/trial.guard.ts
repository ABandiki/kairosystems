import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service';

export const SKIP_TRIAL_CHECK_KEY = 'skipTrialCheck';

@Injectable()
export class TrialGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if trial check should be skipped for this route
    const skipTrialCheck = this.reflector.getAllAndOverride<boolean>(
      SKIP_TRIAL_CHECK_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipTrialCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // As a global guard, this runs BEFORE the per-controller JwtAuthGuard, so
    // request.user isn't populated yet. Resolve the practice from the bearer
    // token ourselves. Missing/invalid token → let the JwtAuthGuard 401 later.
    let user = request.user;
    if (!user) {
      const auth: string | undefined = request.headers?.authorization;
      if (auth?.startsWith('Bearer ')) {
        try {
          user = this.jwtService.verify(auth.slice(7));
        } catch {
          return true; // invalid token — downstream auth guard will reject
        }
      }
    }

    // Super admins bypass trial check
    if (user?.isSuperAdmin || user?.role === 'SUPER_ADMIN') {
      return true;
    }

    // No practice ID means this is not a practice user (skip)
    if (!user?.practiceId) {
      return true;
    }

    // Look up the practice
    const practice = await this.prisma.practice.findUnique({
      where: { id: user.practiceId },
      select: {
        isTrial: true,
        trialEndsAt: true,
        isActive: true,
      },
    });

    if (!practice) {
      throw new ForbiddenException('Practice not found');
    }

    if (!practice.isActive) {
      throw new ForbiddenException(
        'Your practice account has been deactivated. Please contact support at ashley@kairo.clinic',
      );
    }

    // Check if trial has expired
    if (practice.isTrial && practice.trialEndsAt) {
      const now = new Date();
      if (now > practice.trialEndsAt) {
        throw new ForbiddenException(
          'TRIAL_EXPIRED: Your free trial has ended. Please subscribe to continue using Kairo. Contact ashley@kairo.clinic or call +263 785 767 099.',
        );
      }
    }

    return true;
  }
}
