import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    practiceId: string,
    options: {
      search?: string;
      status?: string;
      registeredGpId?: string;
      page?: number | string;
      pageSize?: number | string;
    } = {},
  ) {
    const { search, status, registeredGpId } = options;
    const page = Number(options.page) || 1;
    const pageSize = Number(options.pageSize) || 20;

    const where: Prisma.PatientWhereInput = {
      practiceId,
      ...(status && { status: status as any }),
      ...(registeredGpId && { registeredGpId }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { nhsNumber: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        include: {
          registeredGp: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          alerts: {
            where: { isActive: true },
          },
          _count: {
            select: {
              appointments: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { lastName: 'asc' },
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      data: patients,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string, practiceId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id, practiceId },
      include: {
        registeredGp: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        nominatedPharmacy: true,
        alerts: {
          where: { isActive: true },
          orderBy: { severity: 'desc' },
        },
        medicalHistory: {
          where: { isActive: true },
          orderBy: { date: 'desc' },
        },
        appointments: {
          take: 5,
          orderBy: { scheduledStart: 'desc' },
          include: {
            clinician: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  async create(
    practiceId: string,
    data: Prisma.PatientCreateInput & { practiceId?: string },
  ) {
    const { practiceId: _, dateOfBirth, ...patientData } = data as any;

    // Convert dateOfBirth to ISO DateTime if it's a date-only string
    let parsedDateOfBirth = dateOfBirth;
    if (typeof dateOfBirth === 'string' && !dateOfBirth.includes('T')) {
      parsedDateOfBirth = new Date(dateOfBirth + 'T00:00:00.000Z');
    } else if (typeof dateOfBirth === 'string') {
      parsedDateOfBirth = new Date(dateOfBirth);
    }

    return this.prisma.patient.create({
      data: {
        ...patientData,
        dateOfBirth: parsedDateOfBirth,
        practice: { connect: { id: practiceId } },
      },
    });
  }

  async update(id: string, practiceId: string, data: Prisma.PatientUpdateInput) {
    const patient = await this.findById(id, practiceId);
    return this.prisma.patient.update({
      where: { id: patient.id },
      data,
    });
  }

  async addAlert(
    patientId: string,
    practiceId: string,
    data: {
      type: any;
      severity: any;
      description: string;
    },
  ) {
    await this.findById(patientId, practiceId);
    return this.prisma.patientAlert.create({
      data: {
        ...data,
        patient: { connect: { id: patientId } },
      },
    });
  }

  async getDashboardStats(practiceId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalPatients,
      activePatients,
      registeredToday,
    ] = await Promise.all([
      this.prisma.patient.count({ where: { practiceId } }),
      this.prisma.patient.count({ where: { practiceId, status: 'ACTIVE' } }),
      this.prisma.patient.count({
        where: {
          practiceId,
          createdAt: { gte: today },
        },
      }),
    ]);

    return {
      totalPatients,
      activePatients,
      registeredToday,
    };
  }
}
