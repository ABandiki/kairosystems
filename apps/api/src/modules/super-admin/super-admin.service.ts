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

    // Support both bcrypt hashed passwords and base64 encoded (for demo/dev)
    let isPasswordValid = false;

    if (admin.password.startsWith('$2')) {
      // Bcrypt hash (production)
      isPasswordValid = await bcrypt.compare(password, admin.password);
    } else {
      // Base64 comparison (for demo seeded data)
      const base64Password = Buffer.from(password).toString('base64');
      isPasswordValid = admin.password === base64Password;
    }

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
        subscriptionTier: (data.subscriptionTier as any) || 'BASIC',
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
      subscriptionEndDate?: Date;
    },
  ) {
    const practice = await this.prisma.practice.update({
      where: { id: practiceId },
      data: {
        subscriptionTier: data.subscriptionTier as any,
        maxStaffIncluded: data.maxStaffIncluded,
        extraStaffCount: data.extraStaffCount,
        subscriptionEndDate: data.subscriptionEndDate,
      },
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
