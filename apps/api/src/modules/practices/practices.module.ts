import { Module } from '@nestjs/common';
import { PracticesService } from './practices.service';
import { PracticesController } from './practices.controller';

@Module({
  providers: [PracticesService],
  controllers: [PracticesController],
  exports: [PracticesService],
})
export class PracticesModule {}
