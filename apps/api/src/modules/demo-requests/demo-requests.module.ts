import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DemoRequestsController } from './demo-requests.controller';
import { DemoRequestsService } from './demo-requests.service';
import { EmailService } from '../messaging/email.service';
import { WhatsAppService } from '../messaging/whatsapp.service';

@Module({
  imports: [ConfigModule],
  controllers: [DemoRequestsController],
  providers: [DemoRequestsService, EmailService, WhatsAppService],
})
export class DemoRequestsModule {}
