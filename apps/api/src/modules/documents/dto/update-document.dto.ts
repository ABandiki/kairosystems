import {
  IsString,
  IsOptional,
  IsIn,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDocumentDto {
  @ApiPropertyOptional({ example: 'Updated Blood Test Results' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description for blood test results' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: 'LAB_RESULT',
    enum: [
      'LAB_RESULT',
      'REFERRAL_LETTER',
      'DISCHARGE_SUMMARY',
      'SCAN_REPORT',
      'ECG',
      'CONSENT_FORM',
      'FIT_NOTE',
      'PATIENT_CORRESPONDENCE',
      'OTHER',
    ],
  })
  @IsOptional()
  @IsIn([
    'LAB_RESULT',
    'REFERRAL_LETTER',
    'DISCHARGE_SUMMARY',
    'SCAN_REPORT',
    'ECG',
    'CONSENT_FORM',
    'FIT_NOTE',
    'PATIENT_CORRESPONDENCE',
    'OTHER',
  ])
  type?: string;

  @ApiPropertyOptional({ example: 'clxreviewer123' })
  @IsOptional()
  @IsString()
  reviewedById?: string;
}
