import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MedicalHistoryEntryDto {
  @ApiPropertyOptional({ example: 'clxxxxxxxxxxxxxxxxx' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'CONDITION' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'Type 2 Diabetes Mellitus' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: '2020-06-15' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 'Managed with metformin' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateMedicalHistoryDto {
  @ApiProperty({ type: [MedicalHistoryEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicalHistoryEntryDto)
  entries: MedicalHistoryEntryDto[];
}
