import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { MessagingService } from './messaging.service';

@Injectable()
export class ReminderScheduler {
  private readonly logger = new Logger(ReminderScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly messagingService: MessagingService,
  ) {}

  @Cron('0 */15 * * * *')
  async handleAppointmentReminders() {
    this.logger.log('Running appointment reminder check...');

    const now = new Date();
    const reminderWindowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const reminderWindowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    try {
      const appointments = await this.prisma.appointment.findMany({
        where: {
          scheduledStart: {
            gte: reminderWindowStart,
            lte: reminderWindowEnd,
          },
          reminderSent: false,
          status: {
            in: ['BOOKED', 'CONFIRMED'],
          },
        },
        include: {
          practice: true,
        },
      });

      this.logger.log(
        `Found ${appointments.length} appointments needing reminders`,
      );

      for (const appointment of appointments) {
        try {
          await this.messagingService.sendAppointmentReminder(
            appointment.id,
            appointment.practiceId,
          );

          await this.prisma.appointment.update({
            where: { id: appointment.id },
            data: { reminderSent: true },
          });

          this.logger.log(
            `Reminder sent for appointment ${appointment.id}`,
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `Failed to send reminder for appointment ${appointment.id}: ${errorMessage}`,
          );
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to query appointments for reminders: ${errorMessage}`,
      );
    }
  }
}
