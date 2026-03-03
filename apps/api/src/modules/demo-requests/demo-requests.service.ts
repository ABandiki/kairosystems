import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DemoRequestStatus } from '@prisma/client';

@Injectable()
export class DemoRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    email: string;
    phone?: string;
    practiceName?: string;
    practiceSize?: string;
    message?: string;
  }) {
    return this.prisma.demoRequest.create({ data });
  }

  async findAll(params?: {
    status?: DemoRequestStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, search, page = 1, limit = 20 } = params || {};

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { practiceName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.demoRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          handledBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.demoRequest.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const request = await this.prisma.demoRequest.findUnique({
      where: { id },
      include: {
        handledBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Demo request not found');
    }

    return request;
  }

  async update(
    id: string,
    data: {
      status?: DemoRequestStatus;
      notes?: string;
      handledById?: string;
    },
  ) {
    await this.findById(id); // ensure it exists

    return this.prisma.demoRequest.update({
      where: { id },
      data,
      include: {
        handledBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async getStats() {
    const [total, pending, contacted, converted, declined] = await Promise.all([
      this.prisma.demoRequest.count(),
      this.prisma.demoRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.demoRequest.count({ where: { status: 'CONTACTED' } }),
      this.prisma.demoRequest.count({ where: { status: 'CONVERTED' } }),
      this.prisma.demoRequest.count({ where: { status: 'DECLINED' } }),
    ]);

    return { total, pending, contacted, converted, declined };
  }
}
