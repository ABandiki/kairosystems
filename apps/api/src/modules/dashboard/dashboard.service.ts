import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getPendingTasks(practiceId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      unsignedNotes,
      pendingDevices,
      pendingInvoices,
      overdueInvoices,
      upcomingAppointments,
      pendingPrescriptions,
    ] = await Promise.all([
      // Unsigned/draft consultation notes
      this.prisma.consultation.count({
        where: {
          practiceId,
          isSigned: false,
        },
      }),

      // Pending device registrations
      this.prisma.device.count({
        where: {
          practiceId,
          status: 'PENDING',
        },
      }),

      // Pending invoices
      this.prisma.invoice.count({
        where: {
          practiceId,
          status: 'PENDING',
        },
      }),

      // Overdue invoices
      this.prisma.invoice.count({
        where: {
          practiceId,
          status: 'OVERDUE',
        },
      }),

      // Upcoming appointments (today)
      this.prisma.appointment.count({
        where: {
          practiceId,
          scheduledStart: {
            gte: today,
            lt: tomorrow,
          },
          status: {
            in: ['BOOKED', 'CONFIRMED'],
          },
        },
      }),

      // Pending prescriptions awaiting issue
      this.prisma.prescription.count({
        where: {
          practiceId,
          status: 'PENDING',
        },
      }),
    ]);

    // Return flat array matching frontend expected shape: { type, label, count, route, color }
    const tasks = [
      {
        type: 'overdue_invoices',
        label: 'overdue invoices',
        count: overdueInvoices,
        route: '/billing',
        color: 'red',
      },
      {
        type: 'draft_notes',
        label: 'unsigned consultation notes',
        count: unsignedNotes,
        route: '/notes',
        color: 'amber',
      },
      {
        type: 'pending_invoices',
        label: 'pending invoices',
        count: pendingInvoices,
        route: '/billing',
        color: 'amber',
      },
      {
        type: 'pending_devices',
        label: 'pending device approvals',
        count: pendingDevices,
        route: '/settings',
        color: 'blue',
      },
      {
        type: 'active_prescriptions',
        label: 'pending prescriptions',
        count: pendingPrescriptions,
        route: '/prescriptions',
        color: 'purple',
      },
      {
        type: 'upcoming_appointments',
        label: "today's upcoming appointments",
        count: upcomingAppointments,
        route: '/appointments',
        color: 'teal',
      },
    ];

    return tasks;
  }
}
