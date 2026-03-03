import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsIn,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const PHARMACY_TYPE_VALUES = ['COMMUNITY', 'HOSPITAL', 'ONLINE'] as const;
type PharmacyType = (typeof PHARMACY_TYPE_VALUES)[number];

export class CreatePharmacyDto {
  @ApiProperty({ example: 'Boots Pharmacy' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'FX123' })
  @IsOptional()
  @IsString()
  odsCode?: string;

  @ApiProperty({ example: '45 High Street' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiPropertyOptional({ example: 'Unit 2' })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ example: 'London' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({ example: 'Greater London' })
  @IsOptional()
  @IsString()
  county?: string;

  @ApiProperty({ example: 'SW1A 1AA' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  postcode: string;

  @ApiPropertyOptional({ example: 'United Kingdom' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: '+441234567890' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @ApiPropertyOptional({ example: 'pharmacy@boots.co.uk' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+441234567891' })
  @IsOptional()
  @IsString()
  fax?: string;

  @ApiPropertyOptional({ example: 'COMMUNITY', enum: PHARMACY_TYPE_VALUES })
  @IsOptional()
  @IsIn([...PHARMACY_TYPE_VALUES])
  type?: PharmacyType;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  epsEnabled?: boolean;
}
