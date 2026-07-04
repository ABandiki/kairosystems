import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateTraditionalMedicineDto } from './create-traditional-medicine.dto';

export class UpdateTraditionalMedicineDto extends PartialType(
  OmitType(CreateTraditionalMedicineDto, ['patientId'] as const),
) {}
