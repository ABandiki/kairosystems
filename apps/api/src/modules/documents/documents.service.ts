import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    practiceId: string,
    options: {
      search?: string;
      type?: string;
      patientId?: string;
      page?: number | string;
      pageSize?: number | string;
    } = {},
  ) {
    const { search, type, patientId } = options;
    const page = Number(options.page) || 1;
    const pageSize = Number(options.pageSize) || 20;

    const where: Prisma.DocumentWhereInput = {
      practiceId,
      ...(type && { type: type as any }),
      ...(patientId && { patientId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          {
            patient: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        ],
      }),
    };

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              patientNumber: true,
            },
          },
          uploadedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          reviewedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      data: documents,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string, practiceId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, practiceId },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            patientNumber: true,
            dateOfBirth: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        consultation: {
          select: {
            id: true,
            consultationType: true,
            createdAt: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async findByPatient(patientId: string, practiceId: string) {
    return this.prisma.document.findMany({
      where: { patientId, practiceId },
      include: {
        uploadedBy: {
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

  async create(
    practiceId: string,
    uploadedById: string,
    data: {
      patientId: string;
      type: string;
      name: string;
      description?: string;
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
      consultationId?: string;
    },
  ) {
    // Generate a placeholder filePath since actual file storage is not yet implemented
    const fileName = data.fileName || `${data.name.replace(/\s+/g, '_')}.pdf`;
    const filePath = `/uploads/${practiceId}/${data.patientId}/${Date.now()}_${fileName}`;

    return this.prisma.document.create({
      data: {
        practice: { connect: { id: practiceId } },
        patient: { connect: { id: data.patientId } },
        uploadedBy: { connect: { id: uploadedById } },
        type: data.type as any,
        name: data.name,
        description: data.description,
        filePath,
        fileSize: data.fileSize || 0,
        mimeType: data.mimeType || 'application/pdf',
        ...(data.consultationId && {
          consultation: { connect: { id: data.consultationId } },
        }),
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        uploadedBy: {
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
      name?: string;
      description?: string;
      type?: string;
      reviewedById?: string;
    },
  ) {
    const document = await this.findById(id, practiceId);

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type) updateData.type = data.type;
    if (data.reviewedById) {
      updateData.reviewedBy = { connect: { id: data.reviewedById } };
      updateData.reviewedAt = new Date();
    }

    return this.prisma.document.update({
      where: { id: document.id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        uploadedBy: {
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
    const document = await this.findById(id, practiceId);

    await this.prisma.document.delete({
      where: { id: document.id },
    });

    return { message: 'Document deleted successfully' };
  }
}
