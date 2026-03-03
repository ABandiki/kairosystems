import { IsOptional, IsString, IsIn, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DemoRequestStatus } from '@prisma/client';

export class UpdateDemoRequestDto {
  @ApiPropertyOptional({ example: 'CONTACTED', enum: ['PENDING', 'CONTACTED', 'CONVERTED', 'DECLINED'] })
  @IsOptional()
  @IsIn(['PENDING', 'CONTACTED', 'CONVERTED', 'DECLINED'])
  status?: DemoRequestStatus;

  @ApiPropertyOptional({ example: 'Called and scheduled demo for Friday' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}
