import { Module } from '@nestjs/common';
import { FormSubmissionsController } from './form-submissions.controller';
import { FormSubmissionsService } from './form-submissions.service';
import { TierGuard } from '../auth/guards/tier.guard';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FormSubmissionsController],
  providers: [FormSubmissionsService, TierGuard],
  exports: [FormSubmissionsService],
})
export class FormSubmissionsModule {}
