import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { MessagingService } from './messaging.service';
import { TemplateService } from './template.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { WhatsAppService } from './whatsapp.service';

@ApiTags('messaging')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messaging')
export class MessagingController {
  constructor(
    private readonly messagingService: MessagingService,
    private readonly templateService: TemplateService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  @Post('send')
  async sendMessage(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      patientId: string;
      channel: 'EMAIL' | 'SMS' | 'WHATSAPP';
      subject?: string;
      body: string;
    },
  ) {
    return this.messagingService.sendCustomMessage(
      req.user.practiceId,
      req.user.sub,
      body,
    );
  }

  @Post('appointment/:id/confirm')
  async sendAppointmentConfirmation(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.messagingService.sendAppointmentConfirmation(
      id,
      req.user.practiceId,
    );
  }

  @Post('appointment/:id/remind')
  async sendAppointmentReminder(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.messagingService.sendAppointmentReminder(
      id,
      req.user.practiceId,
    );
  }

  @Get('history')
  async getMessageHistory(
    @Req() req: AuthenticatedRequest,
    @Query('patientId') patientId?: string,
    @Query('channel') channel?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.messagingService.getMessageHistory(req.user.practiceId, {
      patientId,
      channel,
      status,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get('history/:id')
  async getMessageById(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.messagingService.getMessageById(id, req.user.practiceId);
  }

  @Get('templates')
  async getTemplates(@Req() req: AuthenticatedRequest) {
    return this.templateService.getTemplates(req.user.practiceId);
  }

  @Post('templates')
  @UseGuards(RolesGuard)
  @Roles('PRACTICE_ADMIN', 'PRACTICE_MANAGER')
  async createTemplate(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      name: string;
      channel: string;
      type: string;
      subject?: string;
      body: string;
      isDefault?: boolean;
    },
  ) {
    return this.templateService.createTemplate(req.user.practiceId, body);
  }

  @Put('templates/:id')
  @UseGuards(RolesGuard)
  @Roles('PRACTICE_ADMIN', 'PRACTICE_MANAGER')
  async updateTemplate(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body()
    body: Partial<{
      name: string;
      channel: string;
      type: string;
      subject: string;
      body: string;
      isDefault: boolean;
    }>,
  ) {
    return this.templateService.updateTemplate(id, req.user.practiceId, body);
  }

  @Delete('templates/:id')
  @UseGuards(RolesGuard)
  @Roles('PRACTICE_ADMIN', 'PRACTICE_MANAGER')
  async deleteTemplate(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.templateService.deleteTemplate(id, req.user.practiceId);
  }

  @Get('status')
  async getStatus() {
    return {
      emailConfigured: this.emailService.isConfigured(),
      smsConfigured: this.smsService.isConfigured(),
      whatsappConfigured: this.whatsappService.isConfigured(),
    };
  }
}
