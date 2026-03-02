import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { BillingPinService } from './billing-pin.service';
import { TierGuard } from '../auth/guards/tier.guard';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, BillingPinService, TierGuard],
  exports: [InvoicesService, BillingPinService],
})
export class InvoicesModule {}
