import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        practice: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        practice: true,
        workingHours: {
          include: {
            room: true,
          },
        },
      },
    });
  }

  async findByPractice(practiceId: string) {
    return this.prisma.user.findMany({
      where: { practiceId, isActive: true },
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
        workingHours: true,
        createdAt: true,
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async create(data: {
    practiceId: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: any;
    phone?: string;
    gmcNumber?: string;
    nmcNumber?: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async updateLastLogin(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async update(id: string, data: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    avatar: string;
    signature: string;
    gmcNumber: string;
    nmcNumber: string;
    isActive: boolean;
  }>) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
