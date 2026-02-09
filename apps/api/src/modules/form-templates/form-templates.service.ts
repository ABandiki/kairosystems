import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FormTemplateCategory, FormTemplateStatus, Prisma } from '@prisma/client';

@Injectable()
export class FormTemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    practiceId: string,
    params?: {
      search?: string;
      category?: string;
      status?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.FormTemplateWhereInput = {
      practiceId,
    };

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params?.category) {
      where.category = params.category as FormTemplateCategory;
    }

    if (params?.status) {
      where.status = params.status as FormTemplateStatus;
    }

    const [templates, total] = await Promise.all([
      this.prisma.formTemplate.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.formTemplate.count({ where }),
    ]);

    return {
      data: templates.map((t) => ({
        ...t,
        createdByName: `${t.createdBy.firstName} ${t.createdBy.lastName}`,
        lastModified: t.updatedAt.toISOString().split('T')[0],
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string, practiceId: string) {
    const template = await this.prisma.formTemplate.findFirst({
      where: { id, practiceId },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Form template not found');
    }

    return {
      ...template,
      createdByName: `${template.createdBy.firstName} ${template.createdBy.lastName}`,
    };
  }

  async create(
    practiceId: string,
    userId: string,
    data: {
      name: string;
      description?: string;
      category?: string;
      status?: string;
      language?: string;
      isPublic?: boolean;
      questions?: any;
    },
  ) {
    const questions = data.questions || [];
    const questionCount = Array.isArray(questions) ? questions.length : 0;

    return this.prisma.formTemplate.create({
      data: {
        name: data.name,
        description: data.description || '',
        category: (data.category as FormTemplateCategory) || 'CUSTOM',
        status: (data.status as FormTemplateStatus) || 'DRAFT',
        language: data.language || 'English',
        isPublic: data.isPublic || false,
        questions: questions,
        questionCount,
        practice: { connect: { id: practiceId } },
        createdBy: { connect: { id: userId } },
      },
      include: {
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
      name?: string;
      description?: string;
      category?: string;
      status?: string;
      language?: string;
      isPublic?: boolean;
      questions?: any;
    },
  ) {
    const template = await this.prisma.formTemplate.findFirst({
      where: { id, practiceId },
    });

    if (!template) {
      throw new NotFoundException('Form template not found');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category as FormTemplateCategory;
    if (data.status !== undefined) updateData.status = data.status as FormTemplateStatus;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;
    if (data.questions !== undefined) {
      updateData.questions = data.questions;
      updateData.questionCount = Array.isArray(data.questions) ? data.questions.length : 0;
    }

    return this.prisma.formTemplate.update({
      where: { id },
      data: updateData,
      include: {
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

  async duplicate(id: string, practiceId: string, userId: string) {
    const template = await this.prisma.formTemplate.findFirst({
      where: { id, practiceId },
    });

    if (!template) {
      throw new NotFoundException('Form template not found');
    }

    return this.prisma.formTemplate.create({
      data: {
        name: `${template.name} (Copy)`,
        description: template.description,
        category: template.category,
        status: 'DRAFT',
        language: template.language,
        isPublic: false,
        questions: template.questions as any,
        questionCount: template.questionCount,
        practice: { connect: { id: practiceId } },
        createdBy: { connect: { id: userId } },
      },
      include: {
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

  async delete(id: string, practiceId: string) {
    const template = await this.prisma.formTemplate.findFirst({
      where: { id, practiceId },
    });

    if (!template) {
      throw new NotFoundException('Form template not found');
    }

    await this.prisma.formTemplate.delete({
      where: { id },
    });

    return { success: true };
  }
}
