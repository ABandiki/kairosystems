import { IsArray, IsNumber, IsString, ArrayMinSize, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkExtendTrialsDto {
  @ApiProperty({ example: ['clxxx1', 'clxxx2'] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  practiceIds: string[];

  @ApiProperty({ example: 14 })
  @IsNumber()
  @Min(1)
  @Max(365)
  days: number;
}
