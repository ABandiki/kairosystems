import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    practiceId: string,
    options: {
      search?: string;
      type?: string;
      status?: string;
      patientId?: string;
      prescriberId?: string;
      page?: number | string;
      pageSize?: number | string;
    } = {},
  ) {
    const { search, type, status, patientId, prescriberId } = options;
    const page = Number(options.page) || 1;
    const pageSize = Number(options.pageSize) || 20;

    const where: Prisma.PrescriptionWhereInput = {
      practiceId,
      ...(type && { type: type as any }),
      ...(status && { status: status as any }),
      ...(patientId && { patientId }),
      ...(prescriberId && { prescriberId }),
      ...(search && {
        OR: [
          {
            patient: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { patientNumber: { contains: search } },
              ],
            },
          },
          {
            items: {
              some: {
                medicationName: { contains: search, mode: 'insensitive' },
              },
            },
          },
        ],
      }),
    };

    const [prescriptions, total] = await Promise.all([
      this.prisma.prescription.findMany({
        where,
        include: {
          items: true,
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              patientNumber: true,
              dateOfBirth: true,
            },
          },
          prescriber: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          pharmacy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.prescription.count({ where }),
    ]);

    return {
      data: prescriptions,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string, practiceId: string) {
    const prescription = await this.prisma.prescription.findFirst({
      where: { id, practiceId },
      include: {
        items: true,
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            patientNumber: true,
            dateOfBirth: true,
            gender: true,
          },
        },
        prescriber: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            gmcNumber: true,
          },
        },
        pharmacy: true,
        consultation: {
          select: {
            id: true,
            consultationType: true,
            createdAt: true,
          },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    return prescription;
  }

  async create(
    practiceId: string,
    prescriberId: string,
    data: {
      patientId: string;
      type: string;
      consultationId?: string;
      pharmacyId?: string;
      items: Array<{
        medicationName: string;
        dose: string;
        frequency: string;
        duration: string;
        quantity: number;
        instructions?: string;
      }>;
    },
  ) {
    return this.prisma.prescription.create({
      data: {
        practice: { connect: { id: practiceId } },
        patient: { connect: { id: data.patientId } },
        prescriber: { connect: { id: prescriberId } },
        type: data.type as any,
        status: 'PENDING',
        ...(data.consultationId && {
          consultation: { connect: { id: data.consultationId } },
        }),
        ...(data.pharmacyId && {
          pharmacy: { connect: { id: data.pharmacyId } },
        }),
        items: {
          create: data.items.map((item) => ({
            medicationName: item.medicationName,
            dose: item.dose,
            frequency: item.frequency,
            duration: item.duration,
            quantity: item.quantity,
            instructions: item.instructions,
          })),
        },
      },
      include: {
        items: true,
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        prescriber: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    practiceId: string,
    data: {
      status?: string;
      pharmacyId?: string;
      issuedAt?: string;
      items?: Array<{
        id?: string;
        medicationName: string;
        dose: string;
        frequency: string;
        duration: string;
        quantity: number;
        instructions?: string;
      }>;
    },
  ) {
    const prescription = await this.findById(id, practiceId);

    const updateData: any = {};

    if (data.status) {
      updateData.status = data.status;
    }
    if (data.pharmacyId) {
      updateData.pharmacy = { connect: { id: data.pharmacyId } };
    }
    if (data.issuedAt) {
      updateData.issuedAt = new Date(data.issuedAt);
    }

    // If items are provided, delete existing and recreate
    if (data.items) {
      await this.prisma.prescriptionItem.deleteMany({
        where: { prescriptionId: prescription.id },
      });

      updateData.items = {
        create: data.items.map((item) => ({
          medicationName: item.medicationName,
          dose: item.dose,
          frequency: item.frequency,
          duration: item.duration,
          quantity: item.quantity,
          instructions: item.instructions,
        })),
      };
    }

    return this.prisma.prescription.update({
      where: { id: prescription.id },
      data: updateData,
      include: {
        items: true,
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        prescriber: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async delete(id: string, practiceId: string) {
    const prescription = await this.findById(id, practiceId);

    await this.prisma.prescription.delete({
      where: { id: prescription.id },
    });

    return { message: 'Prescription deleted successfully' };
  }

  async getStats(practiceId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalPrescriptions,
      pendingPrescriptions,
      issuedToday,
      issuedThisMonth,
      byType,
      byStatus,
    ] = await Promise.all([
      this.prisma.prescription.count({ where: { practiceId } }),
      this.prisma.prescription.count({
        where: { practiceId, status: 'PENDING' },
      }),
      this.prisma.prescription.count({
        where: {
          practiceId,
          createdAt: { gte: today },
        },
      }),
      this.prisma.prescription.count({
        where: {
          practiceId,
          createdAt: { gte: thisMonthStart },
        },
      }),
      this.prisma.prescription.groupBy({
        by: ['type'],
        where: { practiceId },
        _count: { id: true },
      }),
      this.prisma.prescription.groupBy({
        by: ['status'],
        where: { practiceId },
        _count: { id: true },
      }),
    ]);

    return {
      totalPrescriptions,
      pendingPrescriptions,
      issuedToday,
      issuedThisMonth,
      byType: byType.map((t) => ({ type: t.type, count: t._count.id })),
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
    };
  }
}
