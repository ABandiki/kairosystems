import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, NoteType } from '@prisma/client';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    practiceId: string,
    options: {
      search?: string;
      noteType?: string;
      patientId?: string;
      page?: number | string;
      pageSize?: number | string;
    } = {},
  ) {
    const { search, noteType, patientId } = options;
    const page = Number(options.page) || 1;
    const pageSize = Number(options.pageSize) || 20;

    const where: Prisma.NoteWhereInput = {
      practiceId,
      ...(noteType && noteType !== 'all' && { noteType: noteType as NoteType }),
      ...(patientId && { patientId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { patient: { firstName: { contains: search, mode: 'insensitive' } } },
          { patient: { lastName: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [notes, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.note.count({ where }),
    ]);

    // Transform to match frontend expectations
    const transformedNotes = notes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content,
      noteType: note.noteType,
      patientId: note.patientId,
      patientName: `${note.patient.firstName} ${note.patient.lastName}`,
      createdAt: note.createdAt.toISOString(),
      createdBy: `${note.createdBy.firstName} ${note.createdBy.lastName}`,
      colorCode: note.colorCode,
    }));

    return {
      data: transformedNotes,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string, practiceId: string) {
    const note = await this.prisma.note.findFirst({
      where: { id, practiceId },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return {
      ...note,
      patientName: `${note.patient.firstName} ${note.patient.lastName}`,
      createdByName: `${note.createdBy.firstName} ${note.createdBy.lastName}`,
    };
  }

  async create(
    practiceId: string,
    userId: string,
    data: {
      title: string;
      content: string;
      noteType: string;
      patientId: string;
      colorCode?: string;
      headerImage?: string;
      footerImage?: string;
      appointmentId?: string;
    },
  ) {
    return this.prisma.note.create({
      data: {
        title: data.title,
        content: data.content,
        noteType: data.noteType as NoteType,
        colorCode: data.colorCode || '#FFFFFF',
        headerImage: data.headerImage,
        footerImage: data.footerImage,
        practice: { connect: { id: practiceId } },
        patient: { connect: { id: data.patientId } },
        createdBy: { connect: { id: userId } },
        ...(data.appointmentId && {
          appointment: { connect: { id: data.appointmentId } },
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
        createdBy: {
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
      title?: string;
      content?: string;
      noteType?: string;
      colorCode?: string;
      headerImage?: string;
      footerImage?: string;
    },
  ) {
    await this.findById(id, practiceId);

    return this.prisma.note.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.noteType && { noteType: data.noteType as NoteType }),
        ...(data.colorCode && { colorCode: data.colorCode }),
        ...(data.headerImage !== undefined && { headerImage: data.headerImage }),
        ...(data.footerImage !== undefined && { footerImage: data.footerImage }),
      },
    });
  }

  async delete(id: string, practiceId: string) {
    await this.findById(id, practiceId);
    return this.prisma.note.delete({ where: { id } });
  }
}
