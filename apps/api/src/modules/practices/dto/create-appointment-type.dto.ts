import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsIn,
  IsNumber,
  IsArray,
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

const ROLE_VALUES = [
  'PRACTICE_ADMIN',
  'GP',
  'NURSE',
  'HCA',
  'RECEPTIONIST',
  'PRACTICE_MANAGER',
] as const;
type Role = (typeof ROLE_VALUES)[number];

export class CreateAppointmentTypeDto {
  @ApiProperty({ example: 'GP_CONSULTATION', enum: APPOINTMENT_TYPE_VALUES })
  @IsIn([...APPOINTMENT_TYPE_VALUES])
  @IsNotEmpty()
  type: AppointmentType;

  @ApiProperty({ example: 'GP Consultation' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  label: string;

  @ApiProperty({ example: 'GP-CON' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(5)
  @Max(480)
  defaultDuration: number;

  @ApiProperty({ example: '#4A90D9' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(7)
  color: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: ['GP', 'PRACTICE_ADMIN'], enum: ROLE_VALUES })
  @IsOptional()
  @IsArray()
  @IsIn([...ROLE_VALUES], { each: true })
  allowedRoles?: Role[];
}
