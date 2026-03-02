import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MessageChannel, NotificationType } from '@prisma/client';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getTemplates(practiceId: string) {
    return this.prisma.messageTemplate.findMany({
      where: { practiceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTemplate(id: string, practiceId: string) {
    const template = await this.prisma.messageTemplate.findFirst({
      where: { id, practiceId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async createTemplate(
    practiceId: string,
    data: {
      name: string;
      channel: string;
      type: string;
      subject?: string;
      body: string;
      isDefault?: boolean;
    },
  ) {
    return this.prisma.messageTemplate.create({
      data: {
        name: data.name,
        channel: data.channel as MessageChannel,
        type: data.type as NotificationType,
        subject: data.subject,
        body: data.body,
        isDefault: data.isDefault,
        practiceId,
      },
    });
  }

  async updateTemplate(
    id: string,
    practiceId: string,
    data: Partial<{
      name: string;
      channel: string;
      type: string;
      subject: string;
      body: string;
      isDefault: boolean;
    }>,
  ) {
    const template = await this.getTemplate(id, practiceId);

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.channel !== undefined) updateData.channel = data.channel as MessageChannel;
    if (data.type !== undefined) updateData.type = data.type as NotificationType;
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.body !== undefined) updateData.body = data.body;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;

    return this.prisma.messageTemplate.update({
      where: { id: template.id },
      data: updateData,
    });
  }

  async deleteTemplate(id: string, practiceId: string) {
    const template = await this.getTemplate(id, practiceId);

    return this.prisma.messageTemplate.delete({
      where: { id: template.id },
    });
  }

  renderTemplate(template: string, variables: Record<string, string>): string {
    let rendered = template;
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return rendered;
  }

  async seedDefaults(practiceId: string) {
    const existing = await this.prisma.messageTemplate.findMany({
      where: { practiceId, isDefault: true },
    });

    if (existing.length > 0) {
      this.logger.log(
        `Default templates already exist for practice ${practiceId}`,
      );
      return;
    }

    const defaults: Array<{
      name: string;
      channel: MessageChannel;
      type: NotificationType;
      subject?: string;
      body: string;
      isDefault: boolean;
      practiceId: string;
    }> = [
      // Appointment Booked - Email
      {
        name: 'Appointment Booked',
        channel: MessageChannel.EMAIL,
        type: NotificationType.APPOINTMENT_BOOKED,
        subject: 'Your Appointment at {{practiceName}} is Confirmed',
        body: `<h2>Appointment Confirmed</h2>
<p>Dear {{patientFirstName}},</p>
<p>Your appointment has been booked successfully.</p>
<p><strong>Details:</strong></p>
<ul>
  <li><strong>Date:</strong> {{appointmentDate}}</li>
  <li><strong>Time:</strong> {{appointmentTime}}</li>
  <li><strong>Clinician:</strong> {{clinicianName}}</li>
  <li><strong>Practice:</strong> {{practiceName}}</li>
</ul>
<p>If you need to reschedule or cancel, please contact us at {{practicePhone}}.</p>
<p>Thank you,<br/>{{practiceName}}</p>`,
        isDefault: true,
        practiceId,
      },
      // Appointment Booked - SMS
      {
        name: 'Appointment Booked',
        channel: MessageChannel.SMS,
        type: NotificationType.APPOINTMENT_BOOKED,
        body: `Hi {{patientFirstName}}, your appointment at {{practiceName}} is confirmed for {{appointmentDate}} at {{appointmentTime}} with {{clinicianName}}. To reschedule, call {{practicePhone}}.`,
        isDefault: true,
        practiceId,
      },
      // Appointment Reminder - Email
      {
        name: 'Appointment Reminder',
        channel: MessageChannel.EMAIL,
        type: NotificationType.APPOINTMENT_REMINDER,
        subject: 'Reminder: Your Appointment Tomorrow at {{practiceName}}',
        body: `<h2>Appointment Reminder</h2>
<p>Dear {{patientFirstName}},</p>
<p>This is a friendly reminder about your upcoming appointment.</p>
<p><strong>Details:</strong></p>
<ul>
  <li><strong>Date:</strong> {{appointmentDate}}</li>
  <li><strong>Time:</strong> {{appointmentTime}}</li>
  <li><strong>Clinician:</strong> {{clinicianName}}</li>
  <li><strong>Practice:</strong> {{practiceName}}</li>
</ul>
<p>If you need to reschedule or cancel, please contact us at {{practicePhone}} as soon as possible.</p>
<p>We look forward to seeing you!</p>
<p>Thank you,<br/>{{practiceName}}</p>`,
        isDefault: true,
        practiceId,
      },
      // Appointment Reminder - SMS
      {
        name: 'Appointment Reminder',
        channel: MessageChannel.SMS,
        type: NotificationType.APPOINTMENT_REMINDER,
        body: `Reminder: Hi {{patientFirstName}}, you have an appointment at {{practiceName}} on {{appointmentDate}} at {{appointmentTime}} with {{clinicianName}}. Call {{practicePhone}} to reschedule.`,
        isDefault: true,
        practiceId,
      },
      // Appointment Cancelled - Email
      {
        name: 'Appointment Cancelled',
        channel: MessageChannel.EMAIL,
        type: NotificationType.APPOINTMENT_CANCELLED,
        subject: 'Appointment Cancelled - {{practiceName}}',
        body: `<h2>Appointment Cancelled</h2>
<p>Dear {{patientFirstName}},</p>
<p>Your appointment has been cancelled.</p>
<p><strong>Cancelled Appointment Details:</strong></p>
<ul>
  <li><strong>Date:</strong> {{appointmentDate}}</li>
  <li><strong>Time:</strong> {{appointmentTime}}</li>
  <li><strong>Clinician:</strong> {{clinicianName}}</li>
  <li><strong>Practice:</strong> {{practiceName}}</li>
</ul>
<p>If you would like to rebook, please contact us at {{practicePhone}} or book online.</p>
<p>Thank you,<br/>{{practiceName}}</p>`,
        isDefault: true,
        practiceId,
      },
      // Appointment Cancelled - SMS
      {
        name: 'Appointment Cancelled',
        channel: MessageChannel.SMS,
        type: NotificationType.APPOINTMENT_CANCELLED,
        body: `Hi {{patientFirstName}}, your appointment at {{practiceName}} on {{appointmentDate}} at {{appointmentTime}} has been cancelled. Call {{practicePhone}} to rebook.`,
        isDefault: true,
        practiceId,
      },
      // Appointment Booked - WhatsApp
      {
        name: 'Appointment Booked',
        channel: MessageChannel.WHATSAPP,
        type: NotificationType.APPOINTMENT_BOOKED,
        body: `Hi {{patientFirstName}} 👋\n\nYour appointment at *{{practiceName}}* is confirmed.\n\n📅 *Date:* {{appointmentDate}}\n🕐 *Time:* {{appointmentTime}}\n👨‍⚕️ *Doctor:* {{clinicianName}}\n\nNeed to reschedule? Call us at {{practicePhone}}.`,
        isDefault: true,
        practiceId,
      },
      // Appointment Reminder - WhatsApp
      {
        name: 'Appointment Reminder',
        channel: MessageChannel.WHATSAPP,
        type: NotificationType.APPOINTMENT_REMINDER,
        body: `Hi {{patientFirstName}} 👋\n\nJust a reminder about your upcoming appointment at *{{practiceName}}*.\n\n📅 *Date:* {{appointmentDate}}\n🕐 *Time:* {{appointmentTime}}\n👨‍⚕️ *Doctor:* {{clinicianName}}\n\nCan't make it? Please call {{practicePhone}} to reschedule.`,
        isDefault: true,
        practiceId,
      },
      // Appointment Cancelled - WhatsApp
      {
        name: 'Appointment Cancelled',
        channel: MessageChannel.WHATSAPP,
        type: NotificationType.APPOINTMENT_CANCELLED,
        body: `Hi {{patientFirstName}},\n\nYour appointment at *{{practiceName}}* on {{appointmentDate}} at {{appointmentTime}} has been cancelled.\n\nTo rebook, please call us at {{practicePhone}}.`,
        isDefault: true,
        practiceId,
      },
    ];

    await this.prisma.messageTemplate.createMany({ data: defaults });
    this.logger.log(`Seeded default templates for practice ${practiceId}`);
  }
}
