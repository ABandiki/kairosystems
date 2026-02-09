import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole, SubscriptionTier, DeviceStatus } from '@prisma/client';

@Injectable()
export class OnboardingService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Register a new practice with initial admin and first device
   */
  async registerPractice(data: {
    // Practice details
    practiceName: string;
    practiceEmail: string;
    practicePhone: string;
    odsCode: string; // NHS ODS Code - required for UK practices
    addressLine1: string;
    addressLine2?: string;
    city: string;
    county?: string;
    postcode: string;
    // Admin details
    adminEmail: string;
    adminPassword: string;
    adminFirstName: string;
    adminLastName: string;
    // Device details
    deviceFingerprint: string;
    deviceName: string;
    deviceType: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    // Check if practice email already exists
    const existingPractice = await this.prisma.practice.findFirst({
      where: { email: data.practiceEmail },
    });

    if (existingPractice) {
      throw new ConflictException('A practice with this email already exists');
    }

    // Check if admin email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.adminEmail },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    // Hash the admin password
    const hashedPassword = await bcrypt.hash(data.adminPassword, 10);

    // Create everything in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create the practice
      const practice = await tx.practice.create({
        data: {
          name: data.practiceName,
          email: data.practiceEmail,
          phone: data.practicePhone,
          odsCode: data.odsCode,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          city: data.city,
          county: data.county,
          postcode: data.postcode,
          subscriptionTier: SubscriptionTier.BASIC,
          maxStaffIncluded: 3,
          extraStaffCount: 0,
          isActive: true,
        },
      });

      // 2. Create the admin user
      const admin = await tx.user.create({
        data: {
          email: data.adminEmail,
          password: hashedPassword,
          firstName: data.adminFirstName,
          lastName: data.adminLastName,
          role: UserRole.PRACTICE_ADMIN,
          isActive: true,
          practiceId: practice.id,
        },
      });

      // 3. Register and auto-approve the first device
      const device = await tx.device.create({
        data: {
          practiceId: practice.id,
          deviceFingerprint: data.deviceFingerprint,
          deviceName: data.deviceName,
          deviceType: data.deviceType,
          status: DeviceStatus.APPROVED, // Auto-approve first device
          approvedById: admin.id,
          approvedAt: new Date(),
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });

      return { practice, admin, device };
    });

    // Generate JWT token for immediate login
    const token = this.jwtService.sign({
      sub: result.admin.id,
      email: result.admin.email,
      practiceId: result.practice.id,
      role: result.admin.role,
    });

    return {
      message: 'Practice registered successfully',
      token,
      practice: {
        id: result.practice.id,
        name: result.practice.name,
        email: result.practice.email,
        subscriptionTier: result.practice.subscriptionTier,
      },
      user: {
        id: result.admin.id,
        email: result.admin.email,
        firstName: result.admin.firstName,
        lastName: result.admin.lastName,
        role: result.admin.role,
      },
      device: {
        id: result.device.id,
        deviceName: result.device.deviceName,
        status: result.device.status,
      },
    };
  }

  /**
   * Request device registration for an existing practice
   */
  async requestDeviceRegistration(data: {
    practiceId: string;
    deviceFingerprint: string;
    deviceName: string;
    deviceType: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    // Check if device already exists for this practice
    const existingDevice = await this.prisma.device.findFirst({
      where: {
        practiceId: data.practiceId,
        deviceFingerprint: data.deviceFingerprint,
      },
    });

    if (existingDevice) {
      if (existingDevice.status === DeviceStatus.APPROVED) {
        return {
          status: 'already_approved',
          message: 'This device is already registered and approved',
          device: existingDevice,
        };
      } else if (existingDevice.status === DeviceStatus.PENDING) {
        return {
          status: 'pending',
          message: 'This device is pending approval. Please contact your practice administrator.',
          device: existingDevice,
        };
      } else {
        return {
          status: 'revoked',
          message: 'This device has been revoked. Please contact your practice administrator.',
          device: existingDevice,
        };
      }
    }

    // Create new device registration request
    const device = await this.prisma.device.create({
      data: {
        practiceId: data.practiceId,
        deviceFingerprint: data.deviceFingerprint,
        deviceName: data.deviceName,
        deviceType: data.deviceType,
        status: DeviceStatus.PENDING,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });

    return {
      status: 'pending',
      message: 'Device registration requested. Please contact your practice administrator for approval.',
      device: {
        id: device.id,
        deviceName: device.deviceName,
        status: device.status,
        createdAt: device.createdAt,
      },
    };
  }

  /**
   * Check if a device is registered and approved
   */
  async checkDeviceStatus(practiceId: string, deviceFingerprint: string) {
    const device = await this.prisma.device.findFirst({
      where: {
        practiceId,
        deviceFingerprint,
      },
    });

    if (!device) {
      return {
        registered: false,
        approved: false,
        message: 'Device not registered',
      };
    }

    return {
      registered: true,
      approved: device.status === DeviceStatus.APPROVED,
      status: device.status,
      deviceId: device.id,
      deviceName: device.deviceName,
      message: device.status === DeviceStatus.APPROVED
        ? 'Device is registered and approved'
        : device.status === DeviceStatus.PENDING
        ? 'Device is pending approval'
        : 'Device access has been revoked',
    };
  }

  /**
   * Get practice by email (for device registration flow)
   */
  async getPracticeByEmail(email: string) {
    const practice = await this.prisma.practice.findFirst({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    if (!practice) {
      throw new BadRequestException('Practice not found');
    }

    if (!practice.isActive) {
      throw new BadRequestException('Practice is not active');
    }

    return practice;
  }
}
