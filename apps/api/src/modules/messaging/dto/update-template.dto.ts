import { IsOptional, IsString, IsBoolean, IsIn, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTemplateDto {
  @ApiPropertyOptional({ example: 'Appointment Reminder v2' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'EMAIL', enum: ['EMAIL', 'SMS', 'WHATSAPP'] })
  @IsOptional()
  @IsIn(['EMAIL', 'SMS', 'WHATSAPP'])
  channel?: string;

  @ApiPropertyOptional({ example: 'APPOINTMENT_REMINDER' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  type?: string;

  @ApiPropertyOptional({ example: 'Updated subject line' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @ApiPropertyOptional({ example: 'Updated body text...' })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  body?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
