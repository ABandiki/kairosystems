import { IsNotEmpty, IsOptional, IsString, IsIn, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: 'EMAIL', enum: ['EMAIL', 'SMS', 'WHATSAPP'] })
  @IsIn(['EMAIL', 'SMS', 'WHATSAPP'])
  @IsNotEmpty()
  channel: 'EMAIL' | 'SMS' | 'WHATSAPP';

  @ApiPropertyOptional({ example: 'Appointment Reminder' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @ApiProperty({ example: 'Your appointment is tomorrow at 10am.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  body: string;
}
