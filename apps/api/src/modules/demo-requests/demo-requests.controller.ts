import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SkipTrialCheck } from '../auth/decorators/skip-trial-check.decorator';
import { EmailService } from '../messaging/email.service';
import { WhatsAppService } from '../messaging/whatsapp.service';

@ApiTags('demo-requests')
@Controller('demo-requests')
@SkipTrialCheck()
export class DemoRequestsController {
  private readonly logger = new Logger(DemoRequestsController.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  @Post()
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 per hour
  @ApiOperation({ summary: 'Submit a demo request from the landing page' })
  async submitDemoRequest(
    @Body()
    data: {
      name: string;
      email: string;
      phone: string;
      practiceName: string;
      practiceSize?: string;
      message?: string;
    },
  ) {
    this.logger.log(
      `New demo request from ${data.name} (${data.email}) - ${data.practiceName}`,
    );

    const results = { email: false, whatsapp: false };

    // Send email notification to ashley@kairo.clinic
    const emailHtml = `
      <h2>New Demo Request</h2>
      <table style="border-collapse:collapse;width:100%;max-width:500px;">
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${data.name}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;"><a href="tel:${data.phone}">${data.phone}</a></td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Practice</td><td style="padding:8px;border-bottom:1px solid #eee;">${data.practiceName}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Size</td><td style="padding:8px;border-bottom:1px solid #eee;">${data.practiceSize || 'Not specified'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Message</td><td style="padding:8px;border-bottom:1px solid #eee;">${data.message || 'None'}</td></tr>
      </table>
      <p style="margin-top:16px;color:#666;font-size:13px;">Sent from kairo.clinic landing page</p>
    `;

    const emailResult = await this.emailService.sendEmail(
      'ashley@kairo.clinic',
      `Demo Request: ${data.name} — ${data.practiceName}`,
      emailHtml,
    );
    results.email = emailResult.success;

    // Send WhatsApp notification
    const whatsappBody =
      `📋 *New Demo Request*\n\n` +
      `*Name:* ${data.name}\n` +
      `*Email:* ${data.email}\n` +
      `*Phone:* ${data.phone}\n` +
      `*Practice:* ${data.practiceName}\n` +
      `*Size:* ${data.practiceSize || 'Not specified'}\n` +
      `*Message:* ${data.message || 'None'}\n\n` +
      `_From kairo.clinic_`;

    const whatsappResult = await this.whatsAppService.sendWhatsApp(
      '+447863707798',
      whatsappBody,
    );
    results.whatsapp = whatsappResult.success;

    this.logger.log(
      `Demo request processed - email: ${results.email}, whatsapp: ${results.whatsapp}`,
    );

    return {
      success: true,
      message: 'Demo request received. We will contact you within 24 hours.',
    };
  }
}
