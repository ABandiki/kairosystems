import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Twilio = require('twilio');

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private client: any = null;
  private fromNumber: string;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER', '');

    if (accountSid && authToken && this.fromNumber) {
      this.client = new Twilio(accountSid, authToken);
      this.logger.log('SMS service configured successfully');
    } else {
      this.logger.warn(
        'Twilio credentials not configured. SMS sending is disabled.',
      );
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async sendSms(
    to: string,
    body: string,
  ): Promise<{ success: boolean; sid?: string; error?: string }> {
    if (!this.client) {
      this.logger.warn('Attempted to send SMS but Twilio is not configured');
      return { success: false, error: 'SMS not configured' };
    }

    try {
      const message = await this.client.messages.create({
        body,
        from: this.fromNumber,
        to,
      });

      this.logger.log(`SMS sent successfully to ${to}, sid: ${message.sid}`);
      return { success: true, sid: message.sid };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown SMS error';
      this.logger.error(`Failed to send SMS to ${to}: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }
}
