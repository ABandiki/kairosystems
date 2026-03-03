import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RevokeDeviceDto {
  @ApiPropertyOptional({ example: 'Device lost or stolen' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
