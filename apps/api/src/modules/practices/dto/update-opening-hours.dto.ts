import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  Min,
  Max,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OpeningHoursEntryDto {
  @ApiProperty({ example: 1, description: '0 = Sunday, 6 = Saturday' })
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'openTime must be in HH:mm format (e.g. 09:00)',
  })
  openTime: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'closeTime must be in HH:mm format (e.g. 17:00)',
  })
  closeTime: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}

export class UpdateOpeningHoursDto {
  @ApiProperty({ type: [OpeningHoursEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpeningHoursEntryDto)
  hours: OpeningHoursEntryDto[];
}
