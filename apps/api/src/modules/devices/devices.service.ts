import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DeviceStatus } from '@prisma/client';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Verify if a device is approved for a practice
   */
  async verifyDevice(practiceId: string, deviceFingerprint: string): Promise<boolean> {
    const device = await this.prisma.device.findFirst({
      where: {
        practiceId,
        deviceFingerprint,
        status: DeviceStatus.APPROVED,
      },
    });

    return !!device;
  }

  /**
   * Get device by fingerprint
   */
  async getDeviceByFingerprint(deviceFingerprint: string) {
    return this.prisma.device.findUnique({
      where: { deviceFingerprint },
      include: {
        practice: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Register a new device (pending approval)
   */
  async registerDevice(
    practiceId: string,
    data: {
      deviceFingerprint: string;
      deviceName: string;
      deviceType: string;
      ipAddress?: string;
      userAgent?: string;
    },
  ) {
    // Check if device already exists
    const existing = await this.prisma.device.findUnique({
      where: { deviceFingerprint: data.deviceFingerprint },
    });

    if (existing) {
      if (existing.practiceId !== practiceId) {
        throw new ForbiddenException('This device is registered to another practice');
      }
      return existing;
    }

    return this.prisma.device.create({
      data: {
        practiceId,
        deviceFingerprint: data.deviceFingerprint,
        deviceName: data.deviceName,
        deviceType: data.deviceType,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        status: DeviceStatus.PENDING,
      },
    });
  }

  /**
   * Get all devices for a practice
   */
  async findAllForPractice(practiceId: string) {
    return this.prisma.device.findMany({
      where: { practiceId },
      include: {
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        lastUsedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Approve a device
   */
  async approveDevice(deviceId: string, practiceId: string, approvedByUserId: string) {
    const device = await this.prisma.device.findFirst({
      where: { id: deviceId, practiceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return this.prisma.device.update({
      where: { id: deviceId },
      data: {
        status: DeviceStatus.APPROVED,
        approvedById: approvedByUserId,
        approvedAt: new Date(),
      },
    });
  }

  /**
   * Revoke device access
   */
  async revokeDevice(deviceId: string, practiceId: string, reason?: string) {
    const device = await this.prisma.device.findFirst({
      where: { id: deviceId, practiceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return this.prisma.device.update({
      where: { id: deviceId },
      data: {
        status: DeviceStatus.REVOKED,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    });
  }

  /**
   * Update device last used info
   */
  async updateLastUsed(deviceFingerprint: string, userId: string, ipAddress?: string) {
    await this.prisma.device.update({
      where: { deviceFingerprint },
      data: {
        lastUsedAt: new Date(),
        lastUsedByUserId: userId,
        ipAddress,
      },
    });
  }

  /**
   * Delete a device
   */
  async deleteDevice(deviceId: string, practiceId: string) {
    const device = await this.prisma.device.findFirst({
      where: { id: deviceId, practiceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    await this.prisma.device.delete({
      where: { id: deviceId },
    });

    return { success: true };
  }
}
