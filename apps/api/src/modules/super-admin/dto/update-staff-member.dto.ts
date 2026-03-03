import { IsOptional, IsString, IsEmail, IsBoolean, IsIn, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UpdateStaffMemberDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Smith' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({ example: 'doctor@practice.co.zw' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'GP', enum: ['PRACTICE_ADMIN', 'GP', 'NURSE', 'HCA', 'RECEPTIONIST', 'PRACTICE_MANAGER'] })
  @IsOptional()
  @IsIn(['PRACTICE_ADMIN', 'GP', 'NURSE', 'HCA', 'RECEPTIONIST', 'PRACTICE_MANAGER'])
  role?: UserRole;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '+263771234567' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
