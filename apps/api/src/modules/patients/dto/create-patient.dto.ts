import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsIn,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const GENDER_VALUES = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] as const;
type Gender = (typeof GENDER_VALUES)[number];

const PATIENT_STATUS_VALUES = ['ACTIVE', 'INACTIVE', 'DECEASED', 'TRANSFERRED'] as const;
type PatientStatus = (typeof PATIENT_STATUS_VALUES)[number];

export class CreatePatientDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: '1990-01-15' })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({ example: 'MALE', enum: GENDER_VALUES })
  @IsIn([...GENDER_VALUES])
  @IsNotEmpty()
  gender: Gender;

  @ApiPropertyOptional({ example: 'Mr' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  title?: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+263771234567' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: '+263771234567' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  mobilePhone?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  interpreterRequired?: boolean;

  @ApiPropertyOptional({ example: '123 Main Street' })
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @ApiPropertyOptional({ example: 'Apt 4B' })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiPropertyOptional({ example: 'Harare' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Harare' })
  @IsOptional()
  @IsString()
  county?: string;

  @ApiPropertyOptional({ example: '00263' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  postcode?: string;

  @ApiPropertyOptional({ example: 'Zimbabwe' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiPropertyOptional({ example: '+263771234568' })
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @ApiPropertyOptional({ example: 'Spouse' })
  @IsOptional()
  @IsString()
  emergencyContactRelation?: string;

  @ApiPropertyOptional({ example: 'clxxxxxxxxxxxxxxxxx' })
  @IsOptional()
  @IsString()
  registeredGpId?: string;

  @ApiPropertyOptional({ example: 'clxxxxxxxxxxxxxxxxx' })
  @IsOptional()
  @IsString()
  nominatedPharmacyId?: string;

  @ApiPropertyOptional({ example: 'ACTIVE', enum: PATIENT_STATUS_VALUES })
  @IsOptional()
  @IsIn([...PATIENT_STATUS_VALUES])
  status?: PatientStatus;

  @ApiPropertyOptional({ example: 'PAT-0001' })
  @IsOptional()
  @IsString()
  patientNumber?: string;
}
