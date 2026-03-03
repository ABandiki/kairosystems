import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SuperAdminLoginDto {
  @ApiProperty({ example: 'admin@kairo.clinic' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecureP@ss1' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
