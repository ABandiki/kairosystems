import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SkipTrialCheck } from '../auth/decorators/skip-trial-check.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SkipDeviceCheck } from '../auth/decorators/skip-device-check.decorator';
import { DemoRequestsService } from './demo-requests.service';
import { EmailService } from '../messaging/email.service';
import { WhatsAppService } from '../messaging/whatsapp.service';
import { DemoRequestStatus } from '@prisma/client';
import { SubmitDemoRequestDto } from './dto/submit-demo-request.dto';
import { UpdateDemoRequestDto } from './dto/update-demo-request.dto';

@ApiTags('demo-requests')
@Controller('demo-requests')
@SkipTrialCheck()
export class DemoRequestsController {
  private readonly logger = new Logger(DemoRequestsController.name);

  constructor(
    private readonly demoRequestsService: DemoRequestsService,
    private readonly emailService: EmailService,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  // ==================== PUBLIC ENDPOINT ====================

  @Post()
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 per hour
  @ApiOperation({ summary: 'Submit a demo request from the landing page' })
  async submitDemoRequest(
    @Body() data: SubmitDemoRequestDto,
  ) {
    this.logger.log(
      `New demo request from ${data.name} (${data.email}) - ${data.practiceName}`,
    );

    // Persist to database
    const demoRequest = await this.demoRequestsService.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      practiceName: data.practiceName,
      practiceSize: data.practiceSize,
      message: data.message,
    });

    this.logger.log(`Demo request saved with ID: ${demoRequest.id}`);

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

  // ==================== SUPER ADMIN ENDPOINTS ====================

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all demo requests (super admin)' })
  async findAll(
    @Query('status') status?: DemoRequestStatus,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.demoRequestsService.findAll({
      status,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get demo request stats (super admin)' })
  async getStats() {
    return this.demoRequestsService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single demo request (super admin)' })
  async findById(@Param('id') id: string) {
    return this.demoRequestsService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update demo request status/notes (super admin)' })
  async update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() data: UpdateDemoRequestDto,
  ) {
    return this.demoRequestsService.update(id, {
      ...data,
      handledById: req.user?.sub || req.user?.id,
    });
  }
}
