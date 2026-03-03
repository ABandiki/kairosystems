import { IsOptional, IsString, IsNumber, IsBoolean, IsIn, IsDateString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({ example: 'PROFESSIONAL', enum: ['STARTER', 'PROFESSIONAL', 'CUSTOM'] })
  @IsOptional()
  @IsIn(['STARTER', 'PROFESSIONAL', 'CUSTOM'])
  subscriptionTier?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxStaffIncluded?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  extraStaffCount?: number;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  subscriptionStartDate?: string;

  @ApiPropertyOptional({ example: '2025-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  subscriptionEndDate?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isTrial?: boolean;

  @ApiPropertyOptional({ example: '2024-02-01T00:00:00.000Z', nullable: true })
  @IsOptional()
  @IsDateString()
  trialEndsAt?: string | null;
}
