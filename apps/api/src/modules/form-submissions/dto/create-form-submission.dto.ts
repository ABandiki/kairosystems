import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFormSubmissionDto {
  @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: { q1: 'Yes', q2: 'No' } })
  @IsNotEmpty()
  answers: any;

  @ApiPropertyOptional({ example: 85 })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiPropertyOptional({ example: { section1: 40, section2: 45 } })
  @IsOptional()
  scoreDetails?: any;
}
