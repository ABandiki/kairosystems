import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsIn,
  IsDateString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const APPOINTMENT_TYPE_VALUES = [
  'GP_CONSULTATION',
  'GP_EXTENDED',
  'GP_TELEPHONE',
  'GP_VIDEO',
  'NURSE_APPOINTMENT',
  'NURSE_CHRONIC_DISEASE',
  'HCA_BLOOD_TEST',
  'HCA_HEALTH_CHECK',
  'VACCINATION',
  'SMEAR_TEST',
  'MINOR_SURGERY',
  'HOME_VISIT',
] as const;
type AppointmentType = (typeof APPOINTMENT_TYPE_VALUES)[number];

export class CreateAppointmentDto {
  @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  clinicianId: string;

  @ApiProperty({ example: 'GP_CONSULTATION', enum: APPOINTMENT_TYPE_VALUES })
  @IsIn([...APPOINTMENT_TYPE_VALUES])
  @IsNotEmpty()
  appointmentType: AppointmentType;

  @ApiProperty({ example: '2024-03-15T09:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  scheduledStart: string;

  @ApiProperty({ example: '2024-03-15T09:15:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  scheduledEnd: string;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @IsNotEmpty()
  @Min(5)
  @Max(480)
  duration: number;

  @ApiPropertyOptional({ example: 'clxxxxxxxxxxxxxxxxx' })
  @IsOptional()
  @IsString()
  roomId?: string;

  @ApiPropertyOptional({ example: 'Routine check-up' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({ example: 'Patient requested morning slot' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;
}
