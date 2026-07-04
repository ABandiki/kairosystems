import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    // Check if password matches (bcrypt only)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueSession(user);
  }

  /**
   * Sign in with a Google ID token (Google Identity Services).
   * Only signs in EXISTING Kairo accounts matched by verified email —
   * it never creates users, since accounts belong to a practice.
   */
  async googleLogin(dto: GoogleLoginDto) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new BadRequestException('Google sign-in is not configured');
    }

    let payload;
    try {
      const client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({
        idToken: dto.credential,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Google sign-in failed. Please try again.');
    }

    if (!payload?.email || payload.email_verified !== true) {
      throw new UnauthorizedException('Your Google account email is not verified.');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: payload.email, mode: 'insensitive' },
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'No Kairo account is linked to this Google account. Ask your practice administrator to add you, or sign in with your email and password.',
      );
    }

    const { password: _, ...safeUser } = user;
    return this.issueSession(safeUser);
  }

  /** Shared session issuance: trial checks + JWT. Used by password and Google login. */
  private async issueSession(user: any) {
    // Update last login
    await this.usersService.updateLastLogin(user.id);

    // Get practice trial info
    let trialInfo = null;
    if (user.practiceId) {
      const practice = await this.prisma.practice.findUnique({
        where: { id: user.practiceId },
        select: {
          isTrial: true,
          trialEndsAt: true,
          isActive: true,
          subscriptionTier: true,
        },
      });

      if (practice) {
        const now = new Date();
        const trialExpired = practice.isTrial && practice.trialEndsAt ? now > practice.trialEndsAt : false;

        trialInfo = {
          isTrial: practice.isTrial,
          trialEndsAt: practice.trialEndsAt,
          trialExpired,
          subscriptionTier: practice.subscriptionTier,
        };

        // Note: an expired trial still gets a session — the global TrialGuard
        // blocks every route except billing/profile, so the user can subscribe.
        // The frontend shows the lockout screen based on trial.trialExpired.
      }
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      practiceId: user.practiceId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        practiceId: user.practiceId,
        avatar: user.avatar,
      },
      trial: trialInfo,
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password, ...result } = user;

    // Include practice subscription tier in profile
    let subscriptionTier = null;
    if (user.practiceId) {
      const practice = await this.prisma.practice.findUnique({
        where: { id: user.practiceId },
        select: { subscriptionTier: true },
      });
      if (practice) {
        subscriptionTier = practice.subscriptionTier;
      }
    }

    return { ...result, subscriptionTier };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If an account exists with that email, a reset link has been generated.' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // In production, we would send an email with the reset link here
    // For now, just store the token and return success
    // TODO: Send reset email via SMTP with link containing resetToken
    // For now, token is stored in DB only — not returned in response

    return {
      message: 'If an account exists with that email, a reset link has been generated.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExpiry: { gte: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: 'Password has been reset successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Validate current password (bcrypt only)
    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password has been changed successfully' };
  }
}
