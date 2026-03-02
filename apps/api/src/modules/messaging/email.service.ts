import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private fromName: string;
  private fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const secure = this.configService.get<string>('SMTP_SECURE') === 'true';
    const user = this.configService.get<string>('SMTP_USER');
    const password = this.configService.get<string>('SMTP_PASSWORD');

    this.fromName = this.configService.get<string>('SMTP_FROM_NAME', 'Kairo');
    this.fromEmail = this.configService.get<string>('SMTP_FROM_EMAIL', '');

    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure,
        auth: {
          user,
          pass: password,
        },
      });
      this.logger.log('Email service configured successfully');
    } else {
      this.logger.warn(
        'SMTP_HOST not configured. Email sending is disabled.',
      );
    }
  }

  isConfigured(): boolean {
    return this.transporter !== null;
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.transporter) {
      this.logger.warn('Attempted to send email but SMTP is not configured');
      return { success: false, error: 'Email not configured' };
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent successfully to ${to}, messageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown email error';
      this.logger.error(`Failed to send email to ${to}: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }
}
