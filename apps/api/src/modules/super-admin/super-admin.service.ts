import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SuperAdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Super Admin login - separate from regular user login
   */
  async login(email: string, password: string, ipAddress?: string) {
    const admin = await this.prisma.superAdmin.findUnique({
      where: { email },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password (bcrypt only)
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.superAdmin.update({
      where: { id: admin.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    // Log the login
    await this.logActivity(admin.id, 'LOGIN', null, { ipAddress });

    // Generate token with super admin flag
    const payload = {
      sub: admin.id,
      email: admin.email,
      isSuperAdmin: true,
      role: 'SUPER_ADMIN',
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        isSuperAdmin: true,
      },
    };
  }

  /**
   * Get all practices (for super admin dashboard)
   */
  async getAllPractices() {
    return this.prisma.practice.findMany({
      select: {
        id: true,
        name: true,
        odsCode: true,
        email: true,
        phone: true,
        city: true,
        isActive: true,
        subscriptionTier: true,
        maxStaffIncluded: true,
        extraStaffCount: true,
        isTrial: true,
        trialEndsAt: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            patients: true,
            devices: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get practice details including staff and devices
   */
  async getPracticeDetails(practiceId: string, superAdminId: string) {
    const practice = await this.prisma.practice.findUnique({
      where: { id: practiceId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
          },
        },
        devices: {
          select: {
            id: true,
            deviceName: true,
            deviceType: true,
            status: true,
            lastUsedAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!practice) {
      throw new NotFoundException('Practice not found');
    }

    // Log the access
    await this.logActivity(superAdminId, 'VIEW_PRACTICE', practiceId);

    return practice;
  }

  /**
   * Create a new practice
   */
  async createPractice(
    superAdminId: string,
    data: {
      name: string;
      odsCode: string;
      email: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      county?: string;
      postcode: string;
      subscriptionTier?: string;
      maxStaffIncluded?: number;
    },
  ) {
    const practice = await this.prisma.practice.create({
      data: {
        ...data,
        subscriptionTier: (data.subscriptionTier as any) || 'STARTER',
        maxStaffIncluded: data.maxStaffIncluded || 3,
        subscriptionStartDate: new Date(),
      },
    });

    // Log the creation
    await this.logActivity(superAdminId, 'CREATE_PRACTICE', practice.id, {
      name: practice.name,
      odsCode: practice.odsCode,
    });

    return practice;
  }

  /**
   * Create initial admin user for a practice
   */
  async createPracticeAdmin(
    superAdminId: string,
    practiceId: string,
    data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
    },
  ) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        role: 'PRACTICE_ADMIN',
        practiceId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    // Log the action
    await this.logActivity(superAdminId, 'CREATE_PRACTICE_ADMIN', practiceId, {
      userId: user.id,
      email: user.email,
    });

    return user;
  }

  /**
   * Update practice subscription
   */
  async updatePracticeSubscription(
    superAdminId: string,
    practiceId: string,
    data: {
      subscriptionTier?: string;
      maxStaffIncluded?: number;
      extraStaffCount?: number;
      subscriptionStartDate?: Date;
      subscriptionEndDate?: Date;
      isTrial?: boolean;
      trialEndsAt?: Date | null;
    },
  ) {
    const updateData: any = {};
    if (data.subscriptionTier !== undefined) updateData.subscriptionTier = data.subscriptionTier as any;
    if (data.maxStaffIncluded !== undefined) updateData.maxStaffIncluded = data.maxStaffIncluded;
    if (data.extraStaffCount !== undefined) updateData.extraStaffCount = data.extraStaffCount;
    if (data.subscriptionStartDate !== undefined) updateData.subscriptionStartDate = data.subscriptionStartDate;
    if (data.subscriptionEndDate !== undefined) updateData.subscriptionEndDate = data.subscriptionEndDate;
    if (data.isTrial !== undefined) updateData.isTrial = data.isTrial;
    if (data.trialEndsAt !== undefined) updateData.trialEndsAt = data.trialEndsAt;

    // When activating a paid subscription (trial -> paid), auto-set start date
    if (data.isTrial === false && !data.subscriptionStartDate) {
      updateData.subscriptionStartDate = new Date();
    }

    const practice = await this.prisma.practice.update({
      where: { id: practiceId },
      data: updateData,
    });

    // Log the action
    await this.logActivity(superAdminId, 'UPDATE_SUBSCRIPTION', practiceId, data);

    return practice;
  }

  /**
   * Activate/Deactivate a practice
   */
  async setPracticeActive(superAdminId: string, practiceId: string, isActive: boolean) {
    const practice = await this.prisma.practice.update({
      where: { id: practiceId },
      data: { isActive },
    });

    await this.logActivity(
      superAdminId,
      isActive ? 'ACTIVATE_PRACTICE' : 'DEACTIVATE_PRACTICE',
      practiceId,
    );

    return practice;
  }

  /**
   * Approve a device for a practice
   */
  async approveDevice(superAdminId: string, deviceId: string) {
    const device = await this.prisma.device.update({
      where: { id: deviceId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });

    await this.logActivity(superAdminId, 'APPROVE_DEVICE', device.practiceId, {
      deviceId,
      deviceName: device.deviceName,
    });

    return device;
  }

  /**
   * Get super admin activity log
   */
  async getActivityLog(superAdminId?: string, practiceId?: string, limit = 100) {
    try {
      return await this.prisma.superAdminActivityLog.findMany({
        where: {
          ...(superAdminId && { superAdminId }),
          ...(practiceId && { practiceId }),
        },
        include: {
          superAdmin: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      // If table doesn't exist yet, return empty array
      console.error('Activity log error:', error);
      return [];
    }
  }

  /**
   * Log super admin activity
   */
  private async logActivity(
    superAdminId: string,
    action: string,
    practiceId: string | null,
    details?: any,
  ) {
    await this.prisma.superAdminActivityLog.create({
      data: {
        superAdminId,
        action,
        practiceId,
        details,
      },
    });
  }

  /**
   * Revoke a device
   */
  async revokeDevice(superAdminId: string, deviceId: string, reason?: string) {
    const device = await this.prisma.device.update({
      where: { id: deviceId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
        revokedReason: reason || 'Revoked by super admin',
      },
    });

    await this.logActivity(superAdminId, 'REVOKE_DEVICE', device.practiceId, {
      deviceId,
      deviceName: device.deviceName,
      reason,
    });

    return device;
  }

  /**
   * Get system-wide analytics
   */
  async getAnalytics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all practices with counts
    const practices = await this.prisma.practice.findMany({
      select: {
        id: true,
        name: true,
        subscriptionTier: true,
        isTrial: true,
        trialEndsAt: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            patients: true,
            appointments: true,
            invoices: true,
          },
        },
      },
    });

    // Tier breakdown
    const tierBreakdown = {
      STARTER: practices.filter((p) => p.subscriptionTier === 'STARTER').length,
      PROFESSIONAL: practices.filter((p) => p.subscriptionTier === 'PROFESSIONAL').length,
      CUSTOM: practices.filter((p) => p.subscriptionTier === 'CUSTOM').length,
    };

    // Trial vs Paid
    const trialCount = practices.filter((p) => p.isTrial).length;
    const paidCount = practices.filter((p) => !p.isTrial).length;
    const expiredTrials = practices.filter(
      (p) => p.isTrial && p.trialEndsAt && new Date(p.trialEndsAt) < now,
    ).length;
    const activeTrials = trialCount - expiredTrials;

    // Practices created in last 30 days
    const newPractices30d = practices.filter(
      (p) => new Date(p.createdAt) > thirtyDaysAgo,
    ).length;
    const newPractices7d = practices.filter(
      (p) => new Date(p.createdAt) > sevenDaysAgo,
    ).length;

    // Totals across all practices
    const totalStaff = practices.reduce((sum, p) => sum + p._count.users, 0);
    const totalPatients = practices.reduce((sum, p) => sum + p._count.patients, 0);
    const totalAppointments = practices.reduce((sum, p) => sum + p._count.appointments, 0);
    const totalInvoices = practices.reduce((sum, p) => sum + p._count.invoices, 0);

    // Monthly growth (practices created per month, last 6 months)
    const monthlyGrowth: { month: string; practices: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const count = practices.filter((p) => {
        const created = new Date(p.createdAt);
        return created >= monthStart && created <= monthEnd;
      }).length;
      monthlyGrowth.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        practices: count,
      });
    }

    // Top practices by staff count
    const topPractices = [...practices]
      .sort((a, b) => b._count.users - a._count.users)
      .slice(0, 5)
      .map((p) => ({
        name: p.name,
        staff: p._count.users,
        patients: p._count.patients,
        appointments: p._count.appointments,
        tier: p.subscriptionTier,
      }));

    return {
      overview: {
        totalPractices: practices.length,
        activePractices: practices.filter((p) => p.isActive).length,
        inactivePractices: practices.filter((p) => !p.isActive).length,
        totalStaff,
        totalPatients,
        totalAppointments,
        totalInvoices,
      },
      subscriptions: {
        tierBreakdown,
        trialCount,
        paidCount,
        activeTrials,
        expiredTrials,
      },
      growth: {
        newPractices7d,
        newPractices30d,
        monthlyGrowth,
      },
      topPractices,
    };
  }

  /**
   * Update a staff member from super admin
   */
  async updateStaffMember(
    superAdminId: string,
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: string;
      isActive?: boolean;
      phone?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updateData: any = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role as any;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.phone !== undefined) updateData.phone = data.phone;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        phone: true,
        practiceId: true,
      },
    });

    await this.logActivity(superAdminId, 'UPDATE_STAFF', user.practiceId, {
      userId,
      changes: data,
    });

    return updatedUser;
  }

  /**
   * Create a staff member for a practice from super admin
   */
  async createStaffMember(
    superAdminId: string,
    practiceId: string,
    data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: string;
      phone?: string;
    },
  ) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role as any,
        phone: data.phone,
        practiceId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    await this.logActivity(superAdminId, 'CREATE_STAFF', practiceId, {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return user;
  }

  /**
   * Reset a staff member's password from super admin
   */
  async resetStaffPassword(superAdminId: string, userId: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await this.logActivity(superAdminId, 'RESET_PASSWORD', user.practiceId, {
      userId,
      email: user.email,
    });

    return { success: true, message: 'Password reset successfully' };
  }

  /**
   * Bulk activate/deactivate practices
   */
  async bulkUpdatePracticeStatus(
    superAdminId: string,
    practiceIds: string[],
    isActive: boolean,
  ) {
    await this.prisma.practice.updateMany({
      where: { id: { in: practiceIds } },
      data: { isActive },
    });

    for (const practiceId of practiceIds) {
      await this.logActivity(
        superAdminId,
        isActive ? 'BULK_ACTIVATE' : 'BULK_DEACTIVATE',
        practiceId,
      );
    }

    return { success: true, count: practiceIds.length };
  }

  /**
   * Bulk extend trials
   */
  async bulkExtendTrials(
    superAdminId: string,
    practiceIds: string[],
    days: number,
  ) {
    const newEnd = new Date();
    newEnd.setDate(newEnd.getDate() + days);

    await this.prisma.practice.updateMany({
      where: {
        id: { in: practiceIds },
        isTrial: true,
      },
      data: { trialEndsAt: newEnd },
    });

    for (const practiceId of practiceIds) {
      await this.logActivity(superAdminId, 'BULK_EXTEND_TRIAL', practiceId, { days });
    }

    return { success: true, count: practiceIds.length, newTrialEnd: newEnd };
  }

  /**
   * Send notification to a practice's admin users
   */
  async sendPracticeNotification(
    superAdminId: string,
    practiceId: string,
    data: { title: string; message: string },
  ) {
    // Get all admin users for the practice
    const admins = await this.prisma.user.findMany({
      where: {
        practiceId,
        role: { in: ['PRACTICE_ADMIN', 'PRACTICE_MANAGER'] },
        isActive: true,
      },
      select: { id: true },
    });

    // Create notifications for each admin
    const notifications = await Promise.all(
      admins.map((admin) =>
        this.prisma.notification.create({
          data: {
            practiceId,
            userId: admin.id,
            type: 'SYSTEM',
            title: data.title,
            message: data.message,
            data: { fromSuperAdmin: true },
          },
        }),
      ),
    );

    await this.logActivity(superAdminId, 'SEND_NOTIFICATION', practiceId, {
      title: data.title,
      recipientCount: admins.length,
    });

    return { success: true, notificationsSent: notifications.length };
  }

  /**
   * Broadcast notification to all practices
   */
  async broadcastNotification(
    superAdminId: string,
    data: { title: string; message: string },
  ) {
    // Get all active practice admin users
    const admins = await this.prisma.user.findMany({
      where: {
        role: { in: ['PRACTICE_ADMIN', 'PRACTICE_MANAGER'] },
        isActive: true,
        practice: { isActive: true },
      },
      select: { id: true, practiceId: true },
    });

    // Create notifications for each admin
    const notifications = await Promise.all(
      admins.map((admin) =>
        this.prisma.notification.create({
          data: {
            practiceId: admin.practiceId,
            userId: admin.id,
            type: 'SYSTEM',
            title: data.title,
            message: data.message,
            data: { fromSuperAdmin: true, broadcast: true },
          },
        }),
      ),
    );

    await this.logActivity(superAdminId, 'BROADCAST_NOTIFICATION', null, {
      title: data.title,
      recipientCount: admins.length,
    });

    return { success: true, notificationsSent: notifications.length };
  }

  /**
   * Get revenue overview across all practices
   */
  async getRevenueOverview() {
    const now = new Date();

    // Get all invoices with practice info
    const invoices = await this.prisma.invoice.findMany({
      select: {
        id: true,
        total: true,
        status: true,
        issueDate: true,
        paidAt: true,
        practiceId: true,
        practice: {
          select: {
            name: true,
            subscriptionTier: true,
          },
        },
      },
    });

    // Summary stats
    const totalRevenue = invoices
      .filter((i) => i.status === 'PAID')
      .reduce((sum, i) => sum + i.total, 0);
    const pendingRevenue = invoices
      .filter((i) => i.status === 'PENDING' || i.status === 'DRAFT')
      .reduce((sum, i) => sum + i.total, 0);
    const overdueRevenue = invoices
      .filter((i) => i.status === 'OVERDUE')
      .reduce((sum, i) => sum + i.total, 0);

    // Monthly revenue (last 6 months)
    const monthlyRevenue: { month: string; revenue: number; invoices: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthInvoices = invoices.filter((inv) => {
        const date = new Date(inv.issueDate);
        return date >= monthStart && date <= monthEnd && inv.status === 'PAID';
      });
      monthlyRevenue.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue: monthInvoices.reduce((sum, i) => sum + i.total, 0),
        invoices: monthInvoices.length,
      });
    }

    // Revenue by practice
    const practiceRevenueMap = new Map<string, { name: string; tier: string; revenue: number; invoiceCount: number }>();
    for (const inv of invoices.filter((i) => i.status === 'PAID')) {
      const existing = practiceRevenueMap.get(inv.practiceId);
      if (existing) {
        existing.revenue += inv.total;
        existing.invoiceCount += 1;
      } else {
        practiceRevenueMap.set(inv.practiceId, {
          name: inv.practice.name,
          tier: inv.practice.subscriptionTier,
          revenue: inv.total,
          invoiceCount: 1,
        });
      }
    }

    const revenueByPractice = Array.from(practiceRevenueMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Invoice status breakdown
    const statusBreakdown = {
      PAID: invoices.filter((i) => i.status === 'PAID').length,
      PENDING: invoices.filter((i) => i.status === 'PENDING').length,
      DRAFT: invoices.filter((i) => i.status === 'DRAFT').length,
      OVERDUE: invoices.filter((i) => i.status === 'OVERDUE').length,
      CANCELLED: invoices.filter((i) => i.status === 'CANCELLED').length,
    };

    return {
      summary: {
        totalRevenue,
        pendingRevenue,
        overdueRevenue,
        totalInvoices: invoices.length,
      },
      monthlyRevenue,
      revenueByPractice,
      statusBreakdown,
    };
  }

  /**
   * Create a super admin (only for initial setup)
   */
  async createSuperAdmin(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.superAdmin.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
  }
}
