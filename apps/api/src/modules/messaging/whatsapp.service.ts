import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Twilio = require('twilio');

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private client: any = null;
  private fromNumber: string;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_WHATSAPP_NUMBER', '');

    if (accountSid && authToken && this.fromNumber) {
      this.client = new Twilio(accountSid, authToken);
      this.logger.log('WhatsApp service configured successfully');
    } else {
      this.logger.warn(
        'WhatsApp credentials not configured. WhatsApp sending is disabled.',
      );
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async sendWhatsApp(
    to: string,
    body: string,
  ): Promise<{ success: boolean; sid?: string; error?: string }> {
    if (!this.client) {
      this.logger.warn('Attempted to send WhatsApp but service is not configured');
      return { success: false, error: 'WhatsApp not configured' };
    }

    try {
      const message = await this.client.messages.create({
        body,
        from: `whatsapp:${this.fromNumber}`,
        to: `whatsapp:${to}`,
      });

      this.logger.log(`WhatsApp sent successfully to ${to}, sid: ${message.sid}`);
      return { success: true, sid: message.sid };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown WhatsApp error';
      this.logger.error(`Failed to send WhatsApp to ${to}: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }
}
