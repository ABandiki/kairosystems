import { IsArray, IsBoolean, IsNotEmpty, IsString, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkUpdateStatusDto {
  @ApiProperty({ example: ['clxxx1', 'clxxx2'] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  practiceIds: string[];

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
