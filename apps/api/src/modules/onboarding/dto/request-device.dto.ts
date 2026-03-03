import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestDeviceDto {
  @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  practiceId: string;

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
