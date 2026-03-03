import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitDemoRequestDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'john@practice.co.zw' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+263771234567' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: 'Sunshine Medical Practice' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  practiceName: string;

  @ApiPropertyOptional({ example: '5-10 staff' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  practiceSize?: string;

  @ApiPropertyOptional({ example: 'Interested in the billing module' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}
