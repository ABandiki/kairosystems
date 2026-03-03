import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNumber,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const SUBSCRIPTION_TIER_VALUES = ['STARTER', 'PROFESSIONAL', 'CUSTOM'] as const;
type SubscriptionTier = (typeof SUBSCRIPTION_TIER_VALUES)[number];

export class CreatePracticeDto {
  @ApiProperty({ example: 'Sunrise Medical Practice' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'A12345' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  odsCode: string;

  @ApiProperty({ example: 'admin@sunrise.co.uk' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+441234567890' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: '123 High Street' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiPropertyOptional({ example: 'Suite 4' })
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

  @ApiPropertyOptional({ example: 'PROFESSIONAL', enum: SUBSCRIPTION_TIER_VALUES })
  @IsOptional()
  @IsIn([...SUBSCRIPTION_TIER_VALUES])
  subscriptionTier?: SubscriptionTier;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isTrial?: boolean;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  trialDays?: number;
}
