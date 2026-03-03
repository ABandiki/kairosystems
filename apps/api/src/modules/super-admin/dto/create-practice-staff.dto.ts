import { IsEmail, IsNotEmpty, IsOptional, IsString, IsIn, MaxLength, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreatePracticeStaffDto {
  @ApiProperty({ example: 'doctor@practice.co.zw' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecureP@ss1' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ example: 'GP', enum: ['PRACTICE_ADMIN', 'GP', 'NURSE', 'HCA', 'RECEPTIONIST', 'PRACTICE_MANAGER'] })
  @IsIn(['PRACTICE_ADMIN', 'GP', 'NURSE', 'HCA', 'RECEPTIONIST', 'PRACTICE_MANAGER'])
  @IsNotEmpty()
  role: UserRole;

  @ApiPropertyOptional({ example: '+263771234567' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
