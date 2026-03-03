import {
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFormSubmissionDto {
  @ApiPropertyOptional({ example: { q1: 'Yes', q2: 'No' } })
  @IsOptional()
  answers?: any;

  @ApiPropertyOptional({ example: 85 })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiPropertyOptional({ example: { section1: 40, section2: 45 } })
  @IsOptional()
  scoreDetails?: any;
}
