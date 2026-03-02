import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MessageChannel, NotificationType } from '@prisma/client';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { WhatsAppService } from './whatsapp.service';
import { TemplateService } from './template.service';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly whatsappService: WhatsAppService,
    private readonly templateService: TemplateService,
  ) {}

  async sendAppointmentConfirmation(
    appointmentId: string,
    practiceId: string,
  ) {
    return this.sendAppointmentMessage(
      appointmentId,
      practiceId,
      'APPOINTMENT_BOOKED',
    );
  }

  async sendAppointmentReminder(appointmentId: string, practiceId: string) {
    return this.sendAppointmentMessage(
      appointmentId,
      practiceId,
      'APPOINTMENT_REMINDER',
    );
  }

  async sendAppointmentCancellation(
    appointmentId: string,
    practiceId: string,
  ) {
    return this.sendAppointmentMessage(
      appointmentId,
      practiceId,
      'APPOINTMENT_CANCELLED',
    );
  }

  async sendCustomMessage(
    practiceId: string,
    userId: string,
    data: {
      patientId: string;
      channel: 'EMAIL' | 'SMS' | 'WHATSAPP';
      subject?: string;
      body: string;
    },
  ) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: data.patientId, practiceId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const results: any[] = [];

    if (data.channel === 'EMAIL') {
      if (!patient.email) {
        throw new NotFoundException('Patient does not have an email address');
      }

      const result = await this.emailService.sendEmail(
        patient.email,
        data.subject || 'Message from your practice',
        data.body,
      );

      const log = await this.logMessage({
        practiceId,
        patientId: data.patientId,
        sentById: userId,
        channel: 'EMAIL',
        subject: data.subject,
        body: data.body,
        recipient: patient.email,
        status: result.success ? 'SENT' : 'FAILED',
        externalId: result.messageId,
        statusDetail: result.error,
        sentAt: result.success ? new Date() : undefined,
      });

      results.push(log);
    } else if (data.channel === 'SMS') {
      if (!patient.phone) {
        throw new NotFoundException('Patient does not have a phone number');
      }

      const result = await this.smsService.sendSms(patient.phone, data.body);

      const log = await this.logMessage({
        practiceId,
        patientId: data.patientId,
        sentById: userId,
        channel: 'SMS',
        body: data.body,
        recipient: patient.phone,
        status: result.success ? 'SENT' : 'FAILED',
        externalId: result.sid,
        statusDetail: result.error,
        sentAt: result.success ? new Date() : undefined,
      });

      results.push(log);
    } else if (data.channel === 'WHATSAPP') {
      if (!patient.phone) {
        throw new NotFoundException('Patient does not have a phone number');
      }

      const result = await this.whatsappService.sendWhatsApp(patient.phone, data.body);

      const log = await this.logMessage({
        practiceId,
        patientId: data.patientId,
        sentById: userId,
        channel: 'WHATSAPP',
        body: data.body,
        recipient: patient.phone,
        status: result.success ? 'SENT' : 'FAILED',
        externalId: result.sid,
        statusDetail: result.error,
        sentAt: result.success ? new Date() : undefined,
      });

      results.push(log);
    }

    return results;
  }

  async getMessageHistory(
    practiceId: string,
    params: {
      patientId?: string;
      channel?: string;
      status?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { practiceId };

    if (params.patientId) {
      where.patientId = params.patientId;
    }
    if (params.channel) {
      where.channel = params.channel;
    }
    if (params.status) {
      where.status = params.status;
    }

    const [messages, total] = await Promise.all([
      this.prisma.messageLog.findMany({
        where,
        include: { patient: true, sentBy: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.messageLog.count({ where }),
    ]);

    return {
      data: messages,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getMessageById(id: string, practiceId: string) {
    const message = await this.prisma.messageLog.findFirst({
      where: { id, practiceId },
      include: { patient: true, sentBy: true },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  private async sendAppointmentMessage(
    appointmentId: string,
    practiceId: string,
    templateType: string,
  ) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, practiceId },
      include: {
        patient: true,
        clinician: true,
        practice: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const variables = this.buildTemplateVariables(appointment);
    const results: any[] = [];

    // Send email if patient has email
    if (appointment.patient.email) {
      const emailTemplate = await this.findTemplate(
        practiceId,
        templateType,
        'EMAIL',
      );

      if (emailTemplate) {
        const subject = emailTemplate.subject
          ? this.templateService.renderTemplate(emailTemplate.subject, variables)
          : `Appointment ${templateType.replace('APPOINTMENT_', '')}`;
        const body = this.templateService.renderTemplate(
          emailTemplate.body,
          variables,
        );

        const result = await this.emailService.sendEmail(
          appointment.patient.email,
          subject,
          body,
        );

        const log = await this.logMessage({
          practiceId,
          patientId: appointment.patientId,
          appointmentId: appointment.id,
          templateId: emailTemplate.id,
          channel: 'EMAIL',
          subject,
          body,
          recipient: appointment.patient.email,
          status: result.success ? 'SENT' : 'FAILED',
          externalId: result.messageId,
          statusDetail: result.error,
          sentAt: result.success ? new Date() : undefined,
        });

        results.push(log);
      }
    }

    // Send SMS if patient has phone
    if (appointment.patient.phone) {
      const smsTemplate = await this.findTemplate(
        practiceId,
        templateType,
        'SMS',
      );

      if (smsTemplate) {
        const body = this.templateService.renderTemplate(
          smsTemplate.body,
          variables,
        );

        const result = await this.smsService.sendSms(
          appointment.patient.phone,
          body,
        );

        const log = await this.logMessage({
          practiceId,
          patientId: appointment.patientId,
          appointmentId: appointment.id,
          templateId: smsTemplate.id,
          channel: 'SMS',
          body,
          recipient: appointment.patient.phone,
          status: result.success ? 'SENT' : 'FAILED',
          externalId: result.sid,
          statusDetail: result.error,
          sentAt: result.success ? new Date() : undefined,
        });

        results.push(log);
      }
    }

    // Send WhatsApp if patient has phone and WhatsApp is configured
    if (appointment.patient.phone && this.whatsappService.isConfigured()) {
      const whatsappTemplate = await this.findTemplate(
        practiceId,
        templateType,
        'WHATSAPP',
      );

      if (whatsappTemplate) {
        const body = this.templateService.renderTemplate(
          whatsappTemplate.body,
          variables,
        );

        const result = await this.whatsappService.sendWhatsApp(
          appointment.patient.phone,
          body,
        );

        const log = await this.logMessage({
          practiceId,
          patientId: appointment.patientId,
          appointmentId: appointment.id,
          templateId: whatsappTemplate.id,
          channel: 'WHATSAPP',
          body,
          recipient: appointment.patient.phone,
          status: result.success ? 'SENT' : 'FAILED',
          externalId: result.sid,
          statusDetail: result.error,
          sentAt: result.success ? new Date() : undefined,
        });

        results.push(log);
      }
    }

    return results;
  }

  private buildTemplateVariables(appointment: any): Record<string, string> {
    const scheduledStart = new Date(appointment.scheduledStart);

    return {
      patientFirstName: appointment.patient.firstName || '',
      patientLastName: appointment.patient.lastName || '',
      appointmentDate: scheduledStart.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      appointmentTime: scheduledStart.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      clinicianName: appointment.clinician
        ? `${appointment.clinician.firstName} ${appointment.clinician.lastName}`
        : '',
      practiceName: appointment.practice?.name || '',
      practicePhone: appointment.practice?.phone || '',
    };
  }

  private async findTemplate(
    practiceId: string,
    type: string,
    channel: string,
  ) {
    const template = await this.prisma.messageTemplate.findFirst({
      where: { practiceId, type: type as NotificationType, channel: channel as MessageChannel },
      orderBy: { isDefault: 'asc' },
    });

    if (!template) {
      this.logger.warn(
        `No ${channel} template found for type ${type} in practice ${practiceId}`,
      );
    }

    return template;
  }

  private async logMessage(data: {
    practiceId: string;
    patientId: string;
    appointmentId?: string;
    templateId?: string;
    sentById?: string;
    channel: string;
    subject?: string;
    body: string;
    recipient: string;
    status: string;
    externalId?: string;
    statusDetail?: string;
    sentAt?: Date;
  }) {
    return this.prisma.messageLog.create({
      data: {
        practiceId: data.practiceId,
        patientId: data.patientId,
        appointmentId: data.appointmentId,
        templateId: data.templateId,
        sentById: data.sentById,
        channel: data.channel as any,
        subject: data.subject,
        body: data.body,
        recipient: data.recipient,
        status: data.status as any,
        externalId: data.externalId,
        statusDetail: data.statusDetail,
        sentAt: data.sentAt,
      },
    });
  }
}
