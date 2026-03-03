import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendNotificationDto {
  @ApiProperty({ example: 'System Update' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Scheduled maintenance tonight at 10pm.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;
}
