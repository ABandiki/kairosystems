import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BillingPinDto {
  @ApiProperty({ example: '1234' })
  @IsString()
  @IsNotEmpty()
  @Length(4, 6)
  @Matches(/^\d+$/, { message: 'PIN must contain only digits' })
  pin: string;
}
