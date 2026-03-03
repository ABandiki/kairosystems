import { IsString, IsNotEmpty, IsIn, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const ALERT_TYPE_VALUES = ['ALLERGY', 'SAFEGUARDING', 'MEDICAL', 'COMMUNICATION', 'OTHER'] as const;
type AlertType = (typeof ALERT_TYPE_VALUES)[number];

const ALERT_SEVERITY_VALUES = ['LOW', 'MEDIUM', 'HIGH'] as const;
type AlertSeverity = (typeof ALERT_SEVERITY_VALUES)[number];

export class CreatePatientAlertDto {
  @ApiProperty({ example: 'ALLERGY', enum: ALERT_TYPE_VALUES })
  @IsIn([...ALERT_TYPE_VALUES])
  @IsNotEmpty()
  type: AlertType;

  @ApiProperty({ example: 'HIGH', enum: ALERT_SEVERITY_VALUES })
  @IsIn([...ALERT_SEVERITY_VALUES])
  @IsNotEmpty()
  severity: AlertSeverity;

  @ApiProperty({ example: 'Patient is allergic to penicillin' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;
}
