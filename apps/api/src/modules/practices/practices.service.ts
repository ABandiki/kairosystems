import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PracticesService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const practice = await this.prisma.practice.findUnique({
      where: { id },
      include: {
        openingHours: {
          orderBy: { dayOfWeek: 'asc' },
        },
        rooms: {
          where: { isActive: true },
        },
        appointmentTypeSettings: {
          where: { isActive: true },
        },
      },
    });

    if (!practice) {
      throw new NotFoundException('Practice not found');
    }

    return practice;
  }

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      logo?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      county?: string;
      postcode?: string;
    },
  ) {
    return this.prisma.practice.update({
      where: { id },
      data,
    });
  }

  async updateOpeningHours(
    id: string,
    openingHours: Array<{
      dayOfWeek: number;
      openTime: string;
      closeTime: string;
      isClosed?: boolean;
    }>,
  ) {
    // Delete existing and create new
    await this.prisma.openingHours.deleteMany({ where: { practiceId: id } });

    if (openingHours.length > 0) {
      await this.prisma.openingHours.createMany({
        data: openingHours.map((oh) => ({
          practiceId: id,
          ...oh,
          isClosed: oh.isClosed ?? false,
        })),
      });
    }

    return this.findById(id);
  }

  async getPharmacies(practiceId: string) {
    return this.prisma.pharmacy.findMany({
      where: { practiceId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createPharmacy(
    practiceId: string,
    data: {
      name: string;
      odsCode?: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      county?: string;
      postcode: string;
      phone: string;
      email?: string;
      type?: any;
      epsEnabled?: boolean;
    },
  ) {
    return this.prisma.pharmacy.create({
      data: {
        ...data,
        practice: { connect: { id: practiceId } },
      },
    });
  }

  async getRooms(practiceId: string) {
    return this.prisma.room.findMany({
      where: { practiceId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createRoom(
    practiceId: string,
    data: { name: string; description?: string },
  ) {
    return this.prisma.room.create({
      data: {
        ...data,
        practice: { connect: { id: practiceId } },
      },
    });
  }

  async getAppointmentTypes(practiceId: string) {
    return this.prisma.appointmentTypeSetting.findMany({
      where: { practiceId },
      orderBy: { label: 'asc' },
    });
  }

  async createAppointmentType(
    practiceId: string,
    data: {
      type: string;
      label: string;
      code: string;
      defaultDuration: number;
      color: string;
    },
  ) {
    // Type must be a valid AppointmentType enum value
    // Cast it since frontend may send string
    return this.prisma.appointmentTypeSetting.create({
      data: {
        practiceId,
        type: data.type as any, // Cast to allow any type value
        label: data.label,
        code: data.code,
        defaultDuration: data.defaultDuration,
        color: data.color,
        isActive: true,
        allowedRoles: ['GP', 'NURSE', 'HCA'],
      },
    });
  }

  async updateAppointmentType(
    id: string,
    practiceId: string,
    data: {
      label?: string;
      defaultDuration?: number;
      color?: string;
      isActive?: boolean;
    },
  ) {
    return this.prisma.appointmentTypeSetting.updateMany({
      where: { id, practiceId },
      data,
    });
  }

  async getAnalytics(practiceId: string) {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // ====== Patient Demographics ======
    const [
      patientsByGender,
      patients,
      totalPatients,
    ] = await Promise.all([
      this.prisma.patient.groupBy({
        by: ['gender'],
        where: { practiceId, status: 'ACTIVE' },
        _count: { id: true },
      }),
      this.prisma.patient.findMany({
        where: { practiceId, status: 'ACTIVE' },
        select: { dateOfBirth: true },
      }),
      this.prisma.patient.count({
        where: { practiceId, status: 'ACTIVE' },
      }),
    ]);

    // Calculate age groups
    const ageGroups = { '0-17': 0, '18-30': 0, '31-45': 0, '46-60': 0, '61-75': 0, '76+': 0 };
    patients.forEach((p) => {
      const age = Math.floor(
        (now.getTime() - new Date(p.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
      );
      if (age <= 17) ageGroups['0-17']++;
      else if (age <= 30) ageGroups['18-30']++;
      else if (age <= 45) ageGroups['31-45']++;
      else if (age <= 60) ageGroups['46-60']++;
      else if (age <= 75) ageGroups['61-75']++;
      else ageGroups['76+']++;
    });

    // ====== Appointment Stats ======
    const [
      appointmentsByType,
      appointmentsByClinician,
      completedAppointments,
      dnaAppointments,
      totalAppointmentsThisMonth,
    ] = await Promise.all([
      this.prisma.appointment.groupBy({
        by: ['appointmentType'],
        where: {
          practiceId,
          scheduledStart: { gte: thisMonthStart },
        },
        _count: { id: true },
      }),
      this.prisma.appointment.groupBy({
        by: ['clinicianId'],
        where: {
          practiceId,
          scheduledStart: { gte: thisMonthStart },
        },
        _count: { id: true },
      }),
      this.prisma.appointment.count({
        where: {
          practiceId,
          status: 'COMPLETED',
          scheduledStart: { gte: thisMonthStart },
        },
      }),
      this.prisma.appointment.count({
        where: {
          practiceId,
          status: 'DNA',
          scheduledStart: { gte: thisMonthStart },
        },
      }),
      this.prisma.appointment.count({
        where: {
          practiceId,
          scheduledStart: { gte: thisMonthStart },
        },
      }),
    ]);

    // Get clinician names for appointment breakdown
    const clinicianIds = appointmentsByClinician.map((a) => a.clinicianId);
    const clinicians = clinicianIds.length > 0
      ? await this.prisma.user.findMany({
          where: { id: { in: clinicianIds } },
          select: { id: true, firstName: true, lastName: true, role: true },
        })
      : [];

    const clinicianMap = new Map(clinicians.map((c) => [c.id, c]));

    // ====== Revenue Trends (last 6 months) ======
    const invoices = await this.prisma.invoice.findMany({
      where: {
        practiceId,
        status: 'PAID',
        paidAt: { gte: sixMonthsAgo },
      },
      select: {
        total: true,
        paidAt: true,
        paymentMethod: true,
      },
    });

    // Group revenue by month
    const monthlyRevenue: Record<string, number> = {};
    const revenueByPaymentMethod: Record<string, number> = {};
    invoices.forEach((inv) => {
      if (inv.paidAt) {
        const monthKey = `${inv.paidAt.getFullYear()}-${String(inv.paidAt.getMonth() + 1).padStart(2, '0')}`;
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + inv.total;
      }
      if (inv.paymentMethod) {
        revenueByPaymentMethod[inv.paymentMethod] =
          (revenueByPaymentMethod[inv.paymentMethod] || 0) + inv.total;
      }
    });

    // ====== Staff Workload ======
    const staffWorkload = appointmentsByClinician.map((a) => {
      const clinician = clinicianMap.get(a.clinicianId);
      return {
        clinicianId: a.clinicianId,
        clinicianName: clinician
          ? `${clinician.firstName} ${clinician.lastName}`
          : 'Unknown',
        role: clinician?.role || 'Unknown',
        appointmentsThisMonth: a._count.id,
      };
    });

    // Get pending revenue
    const pendingRevenue = await this.prisma.invoice.aggregate({
      where: { practiceId, status: { in: ['PENDING', 'OVERDUE'] } },
      _sum: { total: true },
    });

    // Shape response to match frontend Reports page expectations
    const genderObj: Record<string, number> = {};
    patientsByGender.forEach((g) => {
      genderObj[g.gender] = g._count.id;
    });

    const byTypeObj: Record<string, number> = {};
    appointmentsByType.forEach((a) => {
      byTypeObj[a.appointmentType] = a._count.id;
    });

    const byMethodObj: Record<string, number> = {};
    Object.entries(revenueByPaymentMethod).forEach(([method, total]) => {
      byMethodObj[method] = total;
    });

    return {
      patientDemographics: {
        total: totalPatients,
        gender: genderObj,
        ageGroups,
      },
      appointmentStats: {
        totalThisMonth: totalAppointmentsThisMonth,
        completionRate:
          totalAppointmentsThisMonth > 0
            ? Math.round((completedAppointments / totalAppointmentsThisMonth) * 100)
            : 0,
        dnaRate:
          totalAppointmentsThisMonth > 0
            ? Math.round((dnaAppointments / totalAppointmentsThisMonth) * 100)
            : 0,
        byType: byTypeObj,
        byClinician: staffWorkload.map((s) => ({
          name: s.clinicianName,
          count: s.appointmentsThisMonth,
        })),
      },
      revenueStats: {
        totalCollected: invoices.reduce((sum, inv) => sum + inv.total, 0),
        totalPending: pendingRevenue._sum.total || 0,
        monthly: Object.entries(monthlyRevenue)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, amount]) => ({ month, amount })),
        byMethod: byMethodObj,
      },
      staffWorkload: staffWorkload.map((s) => ({
        name: s.clinicianName,
        role: s.role,
        appointments: s.appointmentsThisMonth,
        patients: 0, // TODO: count unique patients per clinician
      })),
    };
  }
}
