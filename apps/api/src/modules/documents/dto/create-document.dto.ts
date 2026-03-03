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

export class CreateDocumentDto {
  @ApiProperty({ example: 'clx1234567890' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiPropertyOptional({ example: 'clx0987654321' })
  @IsOptional()
  @IsString()
  consultationId?: string;

  @ApiProperty({
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

  @ApiProperty({ example: '/uploads/documents/blood-test-2024.pdf' })
  @IsString()
  @IsNotEmpty()
  filePath: string;

  @ApiProperty({ example: 204800 })
  @IsNumber()
  @Min(0)
  fileSize: number;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;
}
