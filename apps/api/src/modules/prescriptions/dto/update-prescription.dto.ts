import {
  IsString,
  IsOptional,
  IsArray,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PrescriptionItemDto } from './create-prescription.dto';

export class UpdatePrescriptionDto {
  @ApiPropertyOptional({
    example: 'ISSUED',
    enum: ['PENDING', 'ISSUED', 'DISPENSED', 'CANCELLED'],
  })
  @IsOptional()
  @IsIn(['PENDING', 'ISSUED', 'DISPENSED', 'CANCELLED'])
  status?: string;

  @ApiPropertyOptional({ example: 'clxpharmacy123' })
  @IsOptional()
  @IsString()
  pharmacyId?: string;

  @ApiPropertyOptional({ type: [PrescriptionItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items?: PrescriptionItemDto[];
}
