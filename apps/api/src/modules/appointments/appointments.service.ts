import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    practiceId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      clinicianId?: string;
      patientId?: string;
      status?: AppointmentStatus[];
      appointmentTypes?: string[];
      page?: number;
      pageSize?: number;
    } = {},
  ) {
    const {
      startDate,
      endDate,
      clinicianId,
      patientId,
      status,
      appointmentTypes,
      page = 1,
      pageSize = 50,
    } = options;

    const where: Prisma.AppointmentWhereInput = {
      practiceId,
      ...(startDate && endDate && {
        scheduledStart: {
          gte: startDate,
          lte: endDate,
        },
      }),
      ...(clinicianId && { clinicianId }),
      ...(patientId && { patientId }),
      ...(status?.length && { status: { in: status } }),
      ...(appointmentTypes?.length && { appointmentType: { in: appointmentTypes as any } }),
    };

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              gender: true,
              phone: true,
            },
          },
          clinician: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          room: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { scheduledStart: 'asc' },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      data: appointments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string, practiceId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, practiceId },
      include: {
        patient: {
          include: {
            alerts: { where: { isActive: true } },
          },
        },
        clinician: true,
        room: true,
        consultation: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async create(
    practiceId: string,
    data: {
      patientId: string;
      clinicianId: string;
      appointmentType: any;
      scheduledStart: Date;
      duration: number;
      reason?: string;
      notes?: string;
      isUrgent?: boolean;
      roomId?: string;
    },
  ) {
    const scheduledEnd = new Date(data.scheduledStart);
    scheduledEnd.setMinutes(scheduledEnd.getMinutes() + data.duration);

    // Check for conflicts
    const conflict = await this.checkConflicts(
      practiceId,
      data.clinicianId,
      data.scheduledStart,
      scheduledEnd,
    );

    if (conflict) {
      throw new BadRequestException('Time slot is not available');
    }

    // Use unchecked create input to directly set IDs
    return this.prisma.appointment.create({
      data: {
        practiceId,
        patientId: data.patientId,
        clinicianId: data.clinicianId,
        appointmentType: data.appointmentType,
        scheduledStart: data.scheduledStart,
        scheduledEnd,
        duration: data.duration,
        reason: data.reason,
        notes: data.notes,
        isUrgent: data.isUrgent ?? false,
        roomId: data.roomId,
      },
      include: {
        patient: true,
        clinician: true,
        room: true,
      },
    });
  }

  async updateStatus(id: string, practiceId: string, status: AppointmentStatus) {
    const appointment = await this.findById(id, practiceId);
    return this.prisma.appointment.update({
      where: { id: appointment.id },
      data: { status },
    });
  }

  async cancel(id: string, practiceId: string) {
    return this.updateStatus(id, practiceId, AppointmentStatus.CANCELLED);
  }

  async markDna(id: string, practiceId: string) {
    return this.updateStatus(id, practiceId, AppointmentStatus.DNA);
  }

  async checkIn(id: string, practiceId: string) {
    return this.updateStatus(id, practiceId, AppointmentStatus.ARRIVED);
  }

  async startConsultation(id: string, practiceId: string) {
    return this.updateStatus(id, practiceId, AppointmentStatus.IN_PROGRESS);
  }

  async complete(id: string, practiceId: string) {
    return this.updateStatus(id, practiceId, AppointmentStatus.COMPLETED);
  }

  private async checkConflicts(
    practiceId: string,
    clinicianId: string,
    start: Date,
    end: Date,
    excludeId?: string,
  ) {
    const conflict = await this.prisma.appointment.findFirst({
      where: {
        practiceId,
        clinicianId,
        status: { notIn: [AppointmentStatus.CANCELLED] },
        ...(excludeId && { id: { not: excludeId } }),
        OR: [
          {
            AND: [
              { scheduledStart: { lte: start } },
              { scheduledEnd: { gt: start } },
            ],
          },
          {
            AND: [
              { scheduledStart: { lt: end } },
              { scheduledEnd: { gte: end } },
            ],
          },
          {
            AND: [
              { scheduledStart: { gte: start } },
              { scheduledEnd: { lte: end } },
            ],
          },
        ],
      },
    });

    return conflict;
  }

  async getDashboardStats(practiceId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      todayTotal,
      todayPending,
      monthMissed,
      monthCancelled,
    ] = await Promise.all([
      this.prisma.appointment.count({
        where: {
          practiceId,
          scheduledStart: { gte: today, lt: tomorrow },
        },
      }),
      this.prisma.appointment.count({
        where: {
          practiceId,
          scheduledStart: { gte: today, lt: tomorrow },
          status: { in: [AppointmentStatus.BOOKED, AppointmentStatus.CONFIRMED] },
        },
      }),
      this.prisma.appointment.count({
        where: {
          practiceId,
          scheduledStart: { gte: startOfMonth },
          status: AppointmentStatus.DNA,
        },
      }),
      this.prisma.appointment.count({
        where: {
          practiceId,
          scheduledStart: { gte: startOfMonth },
          status: AppointmentStatus.CANCELLED,
        },
      }),
    ]);

    return {
      todayTotal,
      todayPending,
      todayCompleted: todayTotal - todayPending,
      monthMissed,
      monthCancelled,
    };
  }
}
