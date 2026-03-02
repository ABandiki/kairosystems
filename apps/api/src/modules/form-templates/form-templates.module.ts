import { Module } from '@nestjs/common';
import { FormTemplatesController } from './form-templates.controller';
import { FormTemplatesService } from './form-templates.service';
import { TierGuard } from '../auth/guards/tier.guard';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FormTemplatesController],
  providers: [FormTemplatesService, TierGuard],
  exports: [FormTemplatesService],
})
export class FormTemplatesModule {}
