import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  Prisma,
  TraditionalMedicineCategory,
  TraditionalMedicineStatus,
  TraditionalPractitionerType,
} from '@prisma/client';
import { CreateTraditionalMedicineDto } from './dto/create-traditional-medicine.dto';
import { UpdateTraditionalMedicineDto } from './dto/update-traditional-medicine.dto';
import { assertRefsInPractice } from '../../common/validators/practice-scope.validator';

@Injectable()
export class TraditionalMedicineService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    practiceId: string,
    options: {
      search?: string;
      category?: string;
      status?: string;
      patientId?: string;
      hasInteractionRisk?: string;
      page?: number | string;
      pageSize?: number | string;
    } = {},
  ) {
    const { search, category, status, patientId, hasInteractionRisk } = options;
    const page = Number(options.page) || 1;
    const pageSize = Number(options.pageSize) || 20;

    const where: Prisma.TraditionalMedicineRecordWhereInput = {
      practiceId,
      ...(category &&
        category !== 'all' && {
          category: category as TraditionalMedicineCategory,
        }),
      ...(status &&
        status !== 'all' && { status: status as TraditionalMedicineStatus }),
      ...(patientId && { patientId }),
      ...(hasInteractionRisk === 'true' && { hasInteractionRisk: true }),
      ...(search && {
        OR: [
          { remedyName: { contains: search, mode: 'insensitive' } },
          { localName: { contains: search, mode: 'insensitive' } },
          { indication: { contains: search, mode: 'insensitive' } },
          { patient: { firstName: { contains: search, mode: 'insensitive' } } },
          { patient: { lastName: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [records, total] = await Promise.all([
      this.prisma.traditionalMedicineRecord.findMany({
        where,
        include: {
          patient: {
            select: { id: true, firstName: true, lastName: true },
          },
          recordedBy: {
            select: { id: true, firstName: true, lastName: true, role: true },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.traditionalMedicineRecord.count({ where }),
    ]);

    const transformed = records.map((record) => ({
      ...record,
      patientName: `${record.patient.firstName} ${record.patient.lastName}`,
      recordedByName: `${record.recordedBy.firstName} ${record.recordedBy.lastName}`,
    }));

    return {
      data: transformed,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string, practiceId: string) {
    const record = await this.prisma.traditionalMedicineRecord.findFirst({
      where: { id, practiceId },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true },
        },
        recordedBy: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
        consultation: {
          select: { id: true, consultationType: true, createdAt: true },
        },
      },
    });

    if (!record) {
      throw new NotFoundException('Traditional medicine record not found');
    }

    return {
      ...record,
      patientName: `${record.patient.firstName} ${record.patient.lastName}`,
      recordedByName: `${record.recordedBy.firstName} ${record.recordedBy.lastName}`,
    };
  }

  async create(
    practiceId: string,
    userId: string,
    data: CreateTraditionalMedicineDto,
  ) {
    await assertRefsInPractice(this.prisma, practiceId, {
      patientId: data.patientId,
      consultationId: data.consultationId,
    });

    const record = await this.prisma.traditionalMedicineRecord.create({
      data: {
        remedyName: data.remedyName,
        localName: data.localName,
        category: (data.category as TraditionalMedicineCategory) || 'HERBAL',
        preparation: data.preparation,
        indication: data.indication,
        frequency: data.frequency,
        practitionerType:
          (data.practitionerType as TraditionalPractitionerType) || 'UNKNOWN',
        practitionerName: data.practitionerName,
        status: (data.status as TraditionalMedicineStatus) || 'CURRENT',
        startedAt: data.startedAt ? new Date(data.startedAt) : undefined,
        stoppedAt: data.stoppedAt ? new Date(data.stoppedAt) : undefined,
        hasInteractionRisk: data.hasInteractionRisk ?? false,
        interactionNotes: data.interactionNotes,
        notes: data.notes,
        practice: { connect: { id: practiceId } },
        patient: { connect: { id: data.patientId } },
        recordedBy: { connect: { id: userId } },
        ...(data.consultationId && {
          consultation: { connect: { id: data.consultationId } },
        }),
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // An interaction risk should be visible everywhere the patient chart is,
    // not just in this module — surface it through the alert system.
    if (record.hasInteractionRisk) {
      await this.prisma.patientAlert.create({
        data: {
          patientId: record.patientId,
          type: 'TRADITIONAL_MEDICINE',
          severity: 'HIGH',
          description: `Possible interaction: ${record.remedyName}${
            record.interactionNotes ? ` — ${record.interactionNotes}` : ''
          }`,
        },
      });
    }

    return record;
  }

  async update(id: string, practiceId: string, data: UpdateTraditionalMedicineDto) {
    const existing = await this.findById(id, practiceId);

    const record = await this.prisma.traditionalMedicineRecord.update({
      where: { id },
      data: {
        ...(data.remedyName && { remedyName: data.remedyName }),
        ...(data.localName !== undefined && { localName: data.localName }),
        ...(data.category && {
          category: data.category as TraditionalMedicineCategory,
        }),
        ...(data.preparation !== undefined && { preparation: data.preparation }),
        ...(data.indication !== undefined && { indication: data.indication }),
        ...(data.frequency !== undefined && { frequency: data.frequency }),
        ...(data.practitionerType && {
          practitionerType: data.practitionerType as TraditionalPractitionerType,
        }),
        ...(data.practitionerName !== undefined && {
          practitionerName: data.practitionerName,
        }),
        ...(data.status && { status: data.status as TraditionalMedicineStatus }),
        ...(data.startedAt !== undefined && {
          startedAt: data.startedAt ? new Date(data.startedAt) : null,
        }),
        ...(data.stoppedAt !== undefined && {
          stoppedAt: data.stoppedAt ? new Date(data.stoppedAt) : null,
        }),
        ...(data.hasInteractionRisk !== undefined && {
          hasInteractionRisk: data.hasInteractionRisk,
        }),
        ...(data.interactionNotes !== undefined && {
          interactionNotes: data.interactionNotes,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.consultationId !== undefined && {
          consultationId: data.consultationId || null,
        }),
      },
    });

    // Surface a newly-flagged interaction risk as a patient alert
    if (data.hasInteractionRisk === true && !existing.hasInteractionRisk) {
      await this.prisma.patientAlert.create({
        data: {
          patientId: record.patientId,
          type: 'TRADITIONAL_MEDICINE',
          severity: 'HIGH',
          description: `Possible interaction: ${record.remedyName}${
            record.interactionNotes ? ` — ${record.interactionNotes}` : ''
          }`,
        },
      });
    }

    return record;
  }

  async delete(id: string, practiceId: string) {
    await this.findById(id, practiceId);
    return this.prisma.traditionalMedicineRecord.delete({ where: { id } });
  }

  async getStats(practiceId: string) {
    const [total, current, interactionRisks, byCategory] = await Promise.all([
      this.prisma.traditionalMedicineRecord.count({ where: { practiceId } }),
      this.prisma.traditionalMedicineRecord.count({
        where: { practiceId, status: 'CURRENT' },
      }),
      this.prisma.traditionalMedicineRecord.count({
        where: { practiceId, hasInteractionRisk: true, status: 'CURRENT' },
      }),
      this.prisma.traditionalMedicineRecord.groupBy({
        by: ['category'],
        where: { practiceId },
        _count: true,
      }),
    ]);

    return {
      total,
      current,
      interactionRisks,
      byCategory: byCategory.map((c) => ({
        category: c.category,
        count: c._count,
      })),
    };
  }
}
