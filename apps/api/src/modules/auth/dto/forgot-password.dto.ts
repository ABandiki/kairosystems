import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'doctor@practice.co.zw' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
