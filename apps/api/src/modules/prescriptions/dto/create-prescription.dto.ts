import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsIn,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PrescriptionItemDto {
  @ApiProperty({ example: 'Amoxicillin 500mg' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  medicationName: string;

  @ApiProperty({ example: '500mg' })
  @IsString()
  @IsNotEmpty()
  dose: string;

  @ApiProperty({ example: 'Three times daily' })
  @IsString()
  @IsNotEmpty()
  frequency: string;

  @ApiProperty({ example: '7 days' })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiProperty({ example: 21 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 'Take with food' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  instructions?: string;
}

export class CreatePrescriptionDto {
  @ApiProperty({ example: 'clx1234567890' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiPropertyOptional({ example: 'clx0987654321' })
  @IsOptional()
  @IsString()
  consultationId?: string;

  @ApiPropertyOptional({ example: 'clxpharmacy123' })
  @IsOptional()
  @IsString()
  pharmacyId?: string;

  @ApiProperty({ example: 'ACUTE', enum: ['ACUTE', 'REPEAT'] })
  @IsIn(['ACUTE', 'REPEAT'])
  @IsNotEmpty()
  type: string;

  @ApiProperty({ type: [PrescriptionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items: PrescriptionItemDto[];
}
