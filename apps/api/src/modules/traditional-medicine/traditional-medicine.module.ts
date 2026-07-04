import { Module } from '@nestjs/common';
import { TraditionalMedicineService } from './traditional-medicine.service';
import { TraditionalMedicineController } from './traditional-medicine.controller';

@Module({
  providers: [TraditionalMedicineService],
  controllers: [TraditionalMedicineController],
  exports: [TraditionalMedicineService],
})
export class TraditionalMedicineModule {}
