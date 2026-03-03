import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsIn,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const CATEGORY_VALUES = ['INTAKE', 'ASSESSMENT', 'CONSENT', 'QUESTIONNAIRE', 'CUSTOM'] as const;
type Category = (typeof CATEGORY_VALUES)[number];

const STATUS_VALUES = ['ACTIVE', 'DRAFT'] as const;
type Status = (typeof STATUS_VALUES)[number];

export class CreateFormTemplateDto {
  @ApiProperty({ example: 'Patient Intake Form' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Standard intake form for new patients' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'INTAKE', enum: CATEGORY_VALUES })
  @IsOptional()
  @IsIn([...CATEGORY_VALUES])
  category?: Category;

  @ApiPropertyOptional({ example: 'ACTIVE', enum: STATUS_VALUES })
  @IsOptional()
  @IsIn([...STATUS_VALUES])
  status?: Status;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ example: [{ question: 'What is your name?', type: 'text' }] })
  @IsNotEmpty()
  questions: any;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  questionCount?: number;
}
