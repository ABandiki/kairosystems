import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole, SubscriptionTier } from '@prisma/client';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async findAll(practiceId: string, options: { role?: UserRole; isActive?: boolean } = {}) {
    const { role, isActive = true } = options;

    return this.prisma.user.findMany({
      where: {
        practiceId,
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        avatar: true,
        gmcNumber: true,
        nmcNumber: true,
        isActive: true,
        workingHours: {
          include: {
            room: true,
          },
        },
        createdAt: true,
      },
      orderBy: [{ role: 'asc' }, { lastName: 'asc' }],
    });
  }

  async findById(id: string, practiceId: string) {
    const staff = await this.prisma.user.findFirst({
      where: { id, practiceId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        avatar: true,
        signature: true,
        gmcNumber: true,
        nmcNumber: true,
        isActive: true,
        workingHours: {
          include: {
            room: true,
          },
        },
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    return staff;
  }

  async create(
    practiceId: string,
    data: {
      email: string;
      password?: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      phone?: string;
      gmcNumber?: string;
      nmcNumber?: string;
      isActive?: boolean;
    },
    bypassLimitCheck = false, // For super admin use
  ) {
    // Check staff limits before creating (unless bypassed by super admin)
    if (!bypassLimitCheck) {
      await this.checkStaffLimit(practiceId);
    }

    // Generate a temporary password if not provided
    // In production, you would typically send a password reset email
    const password = data.password || this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const { password: _, ...restData } = data;

    const newStaff = await this.prisma.user.create({
      data: {
        ...restData,
        password: hashedPassword,
        isActive: data.isActive ?? true,
        practice: { connect: { id: practiceId } },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        gmcNumber: true,
        nmcNumber: true,
        isActive: true,
      },
    });

    // Update extra staff count if over limit
    await this.updateExtraStaffCount(practiceId);

    return newStaff;
  }

  /**
   * Check if the practice has reached its staff limit
   */
  private async checkStaffLimit(practiceId: string): Promise<void> {
    const practice = await this.prisma.practice.findUnique({
      where: { id: practiceId },
      select: {
        subscriptionTier: true,
        maxStaffIncluded: true,
      },
    });

    if (!practice) {
      throw new NotFoundException('Practice not found');
    }

    // Enterprise tier has unlimited staff
    if (practice.subscriptionTier === SubscriptionTier.ENTERPRISE) {
      return;
    }

    const currentStaffCount = await this.prisma.user.count({
      where: { practiceId, isActive: true },
    });

    // Get max staff based on subscription tier
    const maxStaff = this.getMaxStaffForTier(practice.subscriptionTier);

    if (currentStaffCount >= maxStaff) {
      throw new ForbiddenException(
        `Staff limit reached. Your ${practice.subscriptionTier} plan includes ${practice.maxStaffIncluded} staff members. ` +
        `You currently have ${currentStaffCount} active staff. Please upgrade your plan or contact support to add more staff.`
      );
    }
  }

  /**
   * Get the maximum staff allowed for a subscription tier
   */
  private getMaxStaffForTier(tier: SubscriptionTier): number {
    switch (tier) {
      case SubscriptionTier.BASIC:
        return 3; // GP, Nurse, Receptionist
      case SubscriptionTier.STANDARD:
        return 5;
      case SubscriptionTier.PREMIUM:
        return 10;
      case SubscriptionTier.ENTERPRISE:
        return Infinity;
      default:
        return 3;
    }
  }

  /**
   * Update the extra staff count for billing purposes
   */
  private async updateExtraStaffCount(practiceId: string): Promise<void> {
    const practice = await this.prisma.practice.findUnique({
      where: { id: practiceId },
      select: {
        subscriptionTier: true,
        maxStaffIncluded: true,
      },
    });

    if (!practice || practice.subscriptionTier === SubscriptionTier.ENTERPRISE) {
      return;
    }

    const currentStaffCount = await this.prisma.user.count({
      where: { practiceId, isActive: true },
    });

    const extraStaff = Math.max(0, currentStaffCount - practice.maxStaffIncluded);

    await this.prisma.practice.update({
      where: { id: practiceId },
      data: { extraStaffCount: extraStaff },
    });
  }

  /**
   * Get staff usage statistics for a practice
   */
  async getStaffUsage(practiceId: string) {
    const practice = await this.prisma.practice.findUnique({
      where: { id: practiceId },
      select: {
        subscriptionTier: true,
        maxStaffIncluded: true,
        extraStaffCount: true,
      },
    });

    if (!practice) {
      throw new NotFoundException('Practice not found');
    }

    const currentStaffCount = await this.prisma.user.count({
      where: { practiceId, isActive: true },
    });

    const staffByRole = await this.prisma.user.groupBy({
      by: ['role'],
      where: { practiceId, isActive: true },
      _count: true,
    });

    return {
      currentCount: currentStaffCount,
      maxIncluded: practice.maxStaffIncluded,
      extraCount: practice.extraStaffCount,
      subscriptionTier: practice.subscriptionTier,
      isAtLimit: currentStaffCount >= this.getMaxStaffForTier(practice.subscriptionTier),
      breakdown: staffByRole.map(item => ({
        role: item.role,
        count: item._count,
      })),
    };
  }

  private generateTempPassword(): string {
    // Generate a random temporary password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async update(
    id: string,
    practiceId: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: UserRole;
      phone?: string;
      gmcNumber?: string;
      nmcNumber?: string;
      isActive?: boolean;
    },
  ) {
    await this.findById(id, practiceId);
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        gmcNumber: true,
        nmcNumber: true,
        isActive: true,
      },
    });
  }

  async updateWorkingHours(
    id: string,
    practiceId: string,
    workingHours: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      roomId?: string;
      isActive: boolean;
    }>,
  ) {
    await this.findById(id, practiceId);

    // Delete existing and create new
    await this.prisma.workingHours.deleteMany({ where: { userId: id } });

    if (workingHours.length > 0) {
      await this.prisma.workingHours.createMany({
        data: workingHours.map((wh) => ({
          userId: id,
          ...wh,
        })),
      });
    }

    return this.findById(id, practiceId);
  }

  async updateSignature(id: string, practiceId: string, signature: string) {
    await this.findById(id, practiceId);
    return this.prisma.user.update({
      where: { id },
      data: { signature },
    });
  }

  async getClinicians(practiceId: string) {
    return this.prisma.user.findMany({
      where: {
        practiceId,
        isActive: true,
        role: { in: [UserRole.GP, UserRole.NURSE, UserRole.HCA] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
      },
      orderBy: [{ role: 'asc' }, { lastName: 'asc' }],
    });
  }
}
