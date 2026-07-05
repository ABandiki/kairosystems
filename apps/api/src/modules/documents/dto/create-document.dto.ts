import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsIn,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const DOCUMENT_TYPES = [
  'LAB_RESULT',
  'REFERRAL_LETTER',
  'DISCHARGE_SUMMARY',
  'SCAN_REPORT',
  'ECG',
  'CONSENT_FORM',
  'FIT_NOTE',
  'PATIENT_CORRESPONDENCE',
  'OTHER',
] as const;

export class CreateDocumentDto {
  @ApiProperty({ example: 'clx1234567890' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiPropertyOptional({ example: 'clx0987654321' })
  @IsOptional()
  @IsString()
  consultationId?: string;

  @ApiProperty({ example: 'LAB_RESULT', enum: DOCUMENT_TYPES })
  @IsIn(DOCUMENT_TYPES)
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'Blood Test Results - Jan 2024' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Full blood count and metabolic panel results' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  // File storage isn't implemented yet — these describe the file metadata only.
  // filePath is generated server-side when omitted.
  @ApiPropertyOptional({ example: 'blood-test-2024.pdf' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileName?: string;

  @ApiPropertyOptional({ example: '/uploads/documents/blood-test-2024.pdf' })
  @IsOptional()
  @IsString()
  filePath?: string;

  @ApiPropertyOptional({ example: 204800 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({ example: 'application/pdf' })
  @IsOptional()
  @IsString()
  mimeType?: string;
}
