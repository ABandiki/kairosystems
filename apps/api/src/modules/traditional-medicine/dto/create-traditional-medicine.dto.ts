import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsIn,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const TRADITIONAL_MEDICINE_CATEGORIES = [
  'HERBAL',
  'DIETARY',
  'SPIRITUAL',
  'PHYSICAL',
  'OTHER',
] as const;

export const TRADITIONAL_MEDICINE_STATUSES = ['CURRENT', 'PAST'] as const;

export const TRADITIONAL_PRACTITIONER_TYPES = [
  'SELF_ADMINISTERED',
  'HERBALIST',
  'TRADITIONAL_HEALTH_PRACTITIONER',
  'FAITH_HEALER',
  'FAMILY_COMMUNITY',
  'UNKNOWN',
] as const;

export class CreateTraditionalMedicineDto {
  @ApiProperty({ example: 'clx1234567890' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiPropertyOptional({ example: 'clx0987654321' })
  @IsOptional()
  @IsString()
  consultationId?: string;

  @ApiProperty({ example: 'African potato (Hypoxis hemerocallidea)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  remedyName: string;

  @ApiPropertyOptional({ example: 'Zumbani' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  localName?: string;

  @ApiPropertyOptional({ enum: TRADITIONAL_MEDICINE_CATEGORIES, default: 'HERBAL' })
  @IsOptional()
  @IsIn(TRADITIONAL_MEDICINE_CATEGORIES)
  category?: string;

  @ApiPropertyOptional({ example: 'Infusion (tea)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  preparation?: string;

  @ApiPropertyOptional({ example: 'Immune support' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  indication?: string;

  @ApiPropertyOptional({ example: 'Twice daily' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  frequency?: string;

  @ApiPropertyOptional({ enum: TRADITIONAL_PRACTITIONER_TYPES, default: 'UNKNOWN' })
  @IsOptional()
  @IsIn(TRADITIONAL_PRACTITIONER_TYPES)
  practitionerType?: string;

  @ApiPropertyOptional({ example: 'Mbuya Nehanda' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  practitionerName?: string;

  @ApiPropertyOptional({ enum: TRADITIONAL_MEDICINE_STATUSES, default: 'CURRENT' })
  @IsOptional()
  @IsIn(TRADITIONAL_MEDICINE_STATUSES)
  status?: string;

  @ApiPropertyOptional({ example: '2026-01-15' })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiPropertyOptional({ example: '2026-03-01' })
  @IsOptional()
  @IsDateString()
  stoppedAt?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  hasInteractionRisk?: boolean;

  @ApiPropertyOptional({
    example: 'Hypoxis may reduce ARV efficacy — discussed with patient',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  interactionNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
