import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FormSubmissionsService {
  constructor(private prisma: PrismaService) {}

  private readonly submissionInclude = {
    template: {
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        questions: true,
        questionCount: true,
      },
    },
    patient: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
      },
    },
    submittedBy: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    },
  };

  private readonly listInclude = {
    template: {
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
      },
    },
    patient: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    },
    submittedBy: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    },
  };

  async findAll(
    practiceId: string,
    params?: {
      search?: string;
      patientId?: string;
      templateId?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    const page = Number(params?.page) || 1;
    const pageSize = Number(params?.pageSize) || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.FormSubmissionWhereInput = {
      practiceId,
    };

    if (params?.patientId) {
      where.patientId = params.patientId;
    }

    if (params?.templateId) {
      where.templateId = params.templateId;
    }

    if (params?.search) {
      where.OR = [
        {
          patient: {
            OR: [
              { firstName: { contains: params.search, mode: 'insensitive' } },
              { lastName: { contains: params.search, mode: 'insensitive' } },
            ],
          },
        },
        {
          template: {
            name: { contains: params.search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (params?.startDate || params?.endDate) {
      where.createdAt = {};
      if (params?.startDate) {
        (where.createdAt as any).gte = new Date(params.startDate);
      }
      if (params?.endDate) {
        (where.createdAt as any).lte = new Date(params.endDate);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.formSubmission.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: this.listInclude,
      }),
      this.prisma.formSubmission.count({ where }),
    ]);

    return {
      data: data.map((s) => ({
        ...s,
        patientName: `${s.patient.firstName} ${s.patient.lastName}`,
        templateName: s.template.name,
        submittedByName: s.submittedBy
          ? `${s.submittedBy.firstName} ${s.submittedBy.lastName}`
          : null,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string, practiceId: string) {
    const submission = await this.prisma.formSubmission.findFirst({
      where: { id, practiceId },
      include: this.submissionInclude,
    });

    if (!submission) {
      throw new NotFoundException('Form submission not found');
    }

    return {
      ...submission,
      patientName: `${submission.patient.firstName} ${submission.patient.lastName}`,
      templateName: submission.template.name,
      submittedByName: submission.submittedBy
        ? `${submission.submittedBy.firstName} ${submission.submittedBy.lastName}`
        : null,
    };
  }

  async findByPatient(
    patientId: string,
    practiceId: string,
    params?: { page?: number; pageSize?: number },
  ) {
    const page = Number(params?.page) || 1;
    const pageSize = Number(params?.pageSize) || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.FormSubmissionWhereInput = {
      practiceId,
      patientId,
    };

    const [data, total] = await Promise.all([
      this.prisma.formSubmission.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: this.listInclude,
      }),
      this.prisma.formSubmission.count({ where }),
    ]);

    return {
      data: data.map((s) => ({
        ...s,
        patientName: `${s.patient.firstName} ${s.patient.lastName}`,
        templateName: s.template.name,
        submittedByName: s.submittedBy
          ? `${s.submittedBy.firstName} ${s.submittedBy.lastName}`
          : null,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getTemplateStats(templateId: string, practiceId: string) {
    const template = await this.prisma.formTemplate.findFirst({
      where: { id: templateId, practiceId },
    });

    if (!template) {
      throw new NotFoundException('Form template not found');
    }

    const submissions = await this.prisma.formSubmission.findMany({
      where: { templateId, practiceId },
      select: { score: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalSubmissions = submissions.length;
    const scoredSubmissions = submissions.filter((s) => s.score !== null);
    const averageScore =
      scoredSubmissions.length > 0
        ? Math.round(
            scoredSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) /
              scoredSubmissions.length,
          )
        : null;

    const lastSubmittedAt =
      submissions.length > 0 ? submissions[0].createdAt.toISOString() : null;

    // Score distribution
    const scoreDistribution: Record<string, number> = {};
    scoredSubmissions.forEach((s) => {
      const score = s.score || 0;
      let range: string;
      if (score <= 4) range = '0-4';
      else if (score <= 9) range = '5-9';
      else if (score <= 14) range = '10-14';
      else if (score <= 19) range = '15-19';
      else range = '20+';
      scoreDistribution[range] = (scoreDistribution[range] || 0) + 1;
    });

    return {
      totalSubmissions,
      averageScore,
      scoreDistribution,
      lastSubmittedAt,
    };
  }

  async create(
    practiceId: string,
    submittedById: string,
    data: {
      templateId: string;
      patientId: string;
      answers: any;
      score?: number;
      scoreDetails?: any;
    },
  ) {
    // Verify template belongs to practice
    const template = await this.prisma.formTemplate.findFirst({
      where: { id: data.templateId, practiceId },
    });

    if (!template) {
      throw new BadRequestException('Form template not found in this practice');
    }

    // Verify patient belongs to practice
    const patient = await this.prisma.patient.findFirst({
      where: { id: data.patientId, practiceId },
    });

    if (!patient) {
      throw new BadRequestException('Patient not found in this practice');
    }

    // Calculate score if not provided and template is an assessment
    let score = data.score ?? null;
    let scoreDetails = data.scoreDetails ?? null;

    if (score === null && template.category === 'ASSESSMENT') {
      const calculated = this.calculateScore(
        template.questions as any[],
        data.answers,
      );
      if (calculated) {
        score = calculated.totalScore;
        scoreDetails = calculated;
      }
    }

    const submission = await this.prisma.formSubmission.create({
      data: {
        answers: data.answers,
        score,
        scoreDetails,
        practice: { connect: { id: practiceId } },
        template: { connect: { id: data.templateId } },
        patient: { connect: { id: data.patientId } },
        submittedBy: { connect: { id: submittedById } },
      },
      include: this.submissionInclude,
    });

    return {
      ...submission,
      patientName: `${submission.patient.firstName} ${submission.patient.lastName}`,
      templateName: submission.template.name,
      submittedByName: submission.submittedBy
        ? `${submission.submittedBy.firstName} ${submission.submittedBy.lastName}`
        : null,
    };
  }

  async update(
    id: string,
    practiceId: string,
    data: {
      answers?: any;
      score?: number;
      scoreDetails?: any;
    },
  ) {
    const submission = await this.prisma.formSubmission.findFirst({
      where: { id, practiceId },
    });

    if (!submission) {
      throw new NotFoundException('Form submission not found');
    }

    const updateData: any = {};
    if (data.answers !== undefined) updateData.answers = data.answers;
    if (data.score !== undefined) updateData.score = data.score;
    if (data.scoreDetails !== undefined)
      updateData.scoreDetails = data.scoreDetails;

    const updated = await this.prisma.formSubmission.update({
      where: { id },
      data: updateData,
      include: this.submissionInclude,
    });

    return {
      ...updated,
      patientName: `${updated.patient.firstName} ${updated.patient.lastName}`,
      templateName: updated.template.name,
      submittedByName: updated.submittedBy
        ? `${updated.submittedBy.firstName} ${updated.submittedBy.lastName}`
        : null,
    };
  }

  async delete(id: string, practiceId: string) {
    const submission = await this.prisma.formSubmission.findFirst({
      where: { id, practiceId },
    });

    if (!submission) {
      throw new NotFoundException('Form submission not found');
    }

    await this.prisma.formSubmission.delete({
      where: { id },
    });

    return { success: true };
  }

  private calculateScore(
    questions: any[],
    answers: Record<string, any>,
  ): {
    totalScore: number;
    maxPossibleScore: number;
    questionScores: Array<{
      questionId: string;
      value: number;
      maxValue: number;
    }>;
  } | null {
    if (!questions || !Array.isArray(questions)) return null;

    const scorableQuestions = questions.filter(
      (q) =>
        q.type === 'multiple_choice_single' &&
        q.options &&
        q.options.length > 0,
    );

    if (scorableQuestions.length === 0) return null;

    const questionScores: Array<{
      questionId: string;
      value: number;
      maxValue: number;
    }> = [];
    let totalScore = 0;
    let maxPossibleScore = 0;

    scorableQuestions.forEach((q) => {
      const answer = answers[q.id];
      const value = typeof answer === 'number' ? answer : parseInt(answer) || 0;
      const maxValue = q.options.length - 1; // Assumes 0-indexed scoring

      questionScores.push({
        questionId: q.id,
        value,
        maxValue,
      });

      totalScore += value;
      maxPossibleScore += maxValue;
    });

    return {
      totalScore,
      maxPossibleScore,
      questionScores,
    };
  }
}
