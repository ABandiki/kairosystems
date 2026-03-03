import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
  Min,
  Max,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WorkingHoursEntryDto {
  @ApiProperty({ example: 1, description: '0 = Sunday, 6 = Saturday' })
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: '09:00', description: 'Start time in HH:mm format' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime must be in HH:mm format (e.g. 09:00)',
  })
  startTime: string;

  @ApiProperty({ example: '17:00', description: 'End time in HH:mm format' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime must be in HH:mm format (e.g. 17:00)',
  })
  endTime: string;

  @ApiPropertyOptional({ example: 'clxroom123' })
  @IsOptional()
  @IsString()
  roomId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateWorkingHoursDto {
  @ApiProperty({ type: [WorkingHoursEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHoursEntryDto)
  hours: WorkingHoursEntryDto[];
}
