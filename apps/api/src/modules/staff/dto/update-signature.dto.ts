import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSignatureDto {
  @ApiProperty({ example: 'data:image/png;base64,...' })
  @IsString()
  @IsNotEmpty()
  signature: string;
}
