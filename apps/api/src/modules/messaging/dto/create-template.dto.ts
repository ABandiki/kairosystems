import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsIn, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ example: 'Appointment Reminder' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'EMAIL', enum: ['EMAIL', 'SMS', 'WHATSAPP'] })
  @IsIn(['EMAIL', 'SMS', 'WHATSAPP'])
  @IsNotEmpty()
  channel: string;

  @ApiProperty({ example: 'APPOINTMENT_REMINDER' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type: string;

  @ApiPropertyOptional({ example: 'Your appointment is coming up' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @ApiProperty({ example: 'Dear {{patientName}}, ...' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  body: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
