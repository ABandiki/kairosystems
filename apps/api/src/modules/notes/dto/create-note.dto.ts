import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const NOTE_TYPE_VALUES = [
  'CONSULTATION',
  'FOLLOW_UP',
  'LAB_REVIEW',
  'REFERRAL',
  'PHONE_CALL',
  'PRESCRIPTION',
  'DISCHARGE',
  'OTHER',
] as const;
type NoteType = (typeof NOTE_TYPE_VALUES)[number];

export class CreateNoteDto {
  @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: 'Initial Consultation Notes' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Patient presented with...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 'CONSULTATION', enum: NOTE_TYPE_VALUES })
  @IsIn([...NOTE_TYPE_VALUES])
  @IsNotEmpty()
  noteType: NoteType;

  @ApiPropertyOptional({ example: '#FF5733' })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  colorCode?: string;

  @ApiPropertyOptional({ example: 'https://example.com/header.png' })
  @IsOptional()
  @IsString()
  headerImage?: string;

  @ApiPropertyOptional({ example: 'https://example.com/footer.png' })
  @IsOptional()
  @IsString()
  footerImage?: string;

  @ApiPropertyOptional({ example: 'clxxxxxxxxxxxxxxxxx' })
  @IsOptional()
  @IsString()
  appointmentId?: string;
}
