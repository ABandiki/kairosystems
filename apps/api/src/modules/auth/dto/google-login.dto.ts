import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
  @ApiProperty({ description: 'Google ID token (JWT credential from Google Identity Services)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  credential: string;
}
