import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { WhatsAppService } from './whatsapp.service';
import { TemplateService } from './template.service';
import { ReminderScheduler } from './reminder.scheduler';

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule],
  controllers: [MessagingController],
  providers: [
    MessagingService,
    EmailService,
    SmsService,
    WhatsAppService,
    TemplateService,
    ReminderScheduler,
  ],
  exports: [MessagingService],
})
export class MessagingModule {}
