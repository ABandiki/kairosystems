import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

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
  ) {
    // Generate a temporary password if not provided
    // In production, you would typically send a password reset email
    const password = data.password || this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const { password: _, ...restData } = data;

    return this.prisma.user.create({
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
