import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DemoRequestsController } from './demo-requests.controller';
import { EmailService } from '../messaging/email.service';
import { WhatsAppService } from '../messaging/whatsapp.service';

@Module({
  imports: [ConfigModule],
  controllers: [DemoRequestsController],
  providers: [EmailService, WhatsAppService],
})
export class DemoRequestsModule {}
