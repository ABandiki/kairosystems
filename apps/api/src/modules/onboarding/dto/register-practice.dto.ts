import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterPracticeDto {
  @ApiProperty({ example: 'Sunshine Medical Practice' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  practiceName: string;

  @ApiProperty({ example: 'info@sunshine.co.zw' })
  @IsEmail()
  @IsNotEmpty()
  practiceEmail: string;

  @ApiProperty({ example: '+263771234567' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  practicePhone: string;

  @ApiProperty({ example: 'ODS001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  odsCode: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  addressLine1: string;

  @ApiPropertyOptional({ example: 'Suite 4B' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  addressLine2?: string;

  @ApiProperty({ example: 'Harare' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiPropertyOptional({ example: 'Harare Province' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  county?: string;

  @ApiProperty({ example: '00263' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  postcode: string;

  @ApiProperty({ example: 'admin@sunshine.co.zw' })
  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;

  @ApiProperty({ example: 'SecureP@ss1' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  adminPassword: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  adminFirstName: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  adminLastName: string;

  @ApiProperty({ example: 'abc123fingerprint' })
  @IsString()
  @IsNotEmpty()
  deviceFingerprint: string;

  @ApiProperty({ example: 'Chrome on MacOS' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  deviceName: string;

  @ApiProperty({ example: 'DESKTOP' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  deviceType: string;
}
