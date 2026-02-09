import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoiceStatus, PaymentMethod, Prisma } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    practiceId: string,
    params?: {
      search?: string;
      status?: string;
      patientId?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.InvoiceWhereInput = {
      practiceId,
    };

    if (params?.search) {
      where.OR = [
        { invoiceNumber: { contains: params.search, mode: 'insensitive' } },
        {
          patient: {
            OR: [
              { firstName: { contains: params.search, mode: 'insensitive' } },
              { lastName: { contains: params.search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    if (params?.status) {
      where.status = params.status as InvoiceStatus;
    }

    if (params?.patientId) {
      where.patientId = params.patientId;
    }

    if (params?.startDate) {
      where.issueDate = {
        ...(where.issueDate as any),
        gte: new Date(params.startDate),
      };
    }

    if (params?.endDate) {
      where.issueDate = {
        ...(where.issueDate as any),
        lte: new Date(params.endDate),
      };
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { issueDate: 'desc' },
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
          items: true,
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        patientId: inv.patientId,
        patientName: `${inv.patient.firstName} ${inv.patient.lastName}`,
        issueDate: inv.issueDate.toISOString().split('T')[0],
        dueDate: inv.dueDate.toISOString().split('T')[0],
        amount: inv.total,
        subtotal: inv.subtotal,
        tax: inv.tax,
        discount: inv.discount,
        status: inv.status,
        paymentMethod: inv.paymentMethod,
        notes: inv.notes,
        items: inv.items,
        createdBy: `${inv.createdBy.firstName} ${inv.createdBy.lastName}`,
        createdAt: inv.createdAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string, practiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, practiceId },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            addressLine1: true,
            city: true,
            postcode: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        items: true,
        appointment: {
          select: {
            id: true,
            scheduledStart: true,
            appointmentType: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return {
      ...invoice,
      patientName: `${invoice.patient.firstName} ${invoice.patient.lastName}`,
      createdByName: `${invoice.createdBy.firstName} ${invoice.createdBy.lastName}`,
    };
  }

  async create(
    practiceId: string,
    userId: string,
    data: {
      patientId: string;
      appointmentId?: string;
      invoiceNumber: string;
      issueDate: string;
      dueDate: string;
      paymentMethod?: string;
      notes?: string;
      items: Array<{
        description: string;
        code?: string;
        quantity: number;
        unitPrice: number;
      }>;
      tax?: number;
      discount?: number;
    },
  ) {
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const tax = data.tax || 0;
    const discount = data.discount || 0;
    const total = subtotal + tax - discount;

    return this.prisma.invoice.create({
      data: {
        invoiceNumber: data.invoiceNumber,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        status: 'PENDING',
        paymentMethod: data.paymentMethod
          ? (data.paymentMethod.toUpperCase().replace(' ', '_') as PaymentMethod)
          : null,
        notes: data.notes,
        subtotal,
        tax,
        discount,
        total,
        practice: { connect: { id: practiceId } },
        patient: { connect: { id: data.patientId } },
        createdBy: { connect: { id: userId } },
        ...(data.appointmentId && data.appointmentId !== 'none'
          ? { appointment: { connect: { id: data.appointmentId } } }
          : {}),
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            code: item.code || '',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        items: true,
      },
    });
  }

  async update(
    id: string,
    practiceId: string,
    data: {
      status?: string;
      paymentMethod?: string;
      notes?: string;
      items?: Array<{
        id?: string;
        description: string;
        code?: string;
        quantity: number;
        unitPrice: number;
      }>;
      tax?: number;
      discount?: number;
    },
  ) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, practiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const updateData: any = {};
    if (data.status) updateData.status = data.status as InvoiceStatus;
    if (data.paymentMethod) {
      updateData.paymentMethod = data.paymentMethod
        .toUpperCase()
        .replace(' ', '_') as PaymentMethod;
    }
    if (data.notes !== undefined) updateData.notes = data.notes;

    // If items are provided, recalculate totals
    if (data.items) {
      const subtotal = data.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );
      updateData.subtotal = subtotal;
      updateData.tax = data.tax ?? invoice.tax;
      updateData.discount = data.discount ?? invoice.discount;
      updateData.total = subtotal + updateData.tax - updateData.discount;

      // Delete existing items and create new ones
      await this.prisma.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });

      await this.prisma.invoiceItem.createMany({
        data: data.items.map((item) => ({
          invoiceId: id,
          description: item.description,
          code: item.code || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
      });
    } else if (data.tax !== undefined || data.discount !== undefined) {
      updateData.tax = data.tax ?? invoice.tax;
      updateData.discount = data.discount ?? invoice.discount;
      updateData.total = invoice.subtotal + updateData.tax - updateData.discount;
    }

    if (data.status === 'PAID') {
      updateData.paidAt = new Date();
    }

    return this.prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        items: true,
      },
    });
  }

  async delete(id: string, practiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, practiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    await this.prisma.invoice.delete({
      where: { id },
    });

    return { success: true };
  }

  async getStats(practiceId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [billedThisMonth, collectedThisMonth, outstanding] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: {
          practiceId,
          issueDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: { total: true },
      }),
      this.prisma.invoice.aggregate({
        where: {
          practiceId,
          status: 'PAID',
          issueDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: { total: true },
      }),
      this.prisma.invoice.aggregate({
        where: {
          practiceId,
          status: { in: ['PENDING', 'OVERDUE'] },
        },
        _sum: { total: true },
      }),
    ]);

    return {
      billedThisMonth: billedThisMonth._sum.total || 0,
      collectedThisMonth: collectedThisMonth._sum.total || 0,
      outstandingBalance: outstanding._sum.total || 0,
    };
  }
}
