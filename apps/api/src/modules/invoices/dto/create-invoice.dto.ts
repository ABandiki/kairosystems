import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsIn,
  IsDateString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InvoiceItemDto {
  @ApiProperty({ example: 'GP Consultation' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'CONS-001' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @Min(0)
  total: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: 'clx1234567890' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiPropertyOptional({ example: 'clx0987654321' })
  @IsOptional()
  @IsString()
  appointmentId?: string;

  @ApiProperty({ example: 'INV-2024-0001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  invoiceNumber: string;

  @ApiPropertyOptional({ example: 'DRAFT', enum: ['DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'] })
  @IsOptional()
  @IsIn(['DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'])
  status?: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  issueDate: string;

  @ApiProperty({ example: '2024-02-15' })
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @ApiProperty({ example: 100.0 })
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiPropertyOptional({ example: 15.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @ApiPropertyOptional({ example: 10.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiProperty({ example: 105.0 })
  @IsNumber()
  @Min(0)
  total: number;

  @ApiPropertyOptional({
    example: 'CARD',
    enum: ['CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'INSURANCE'],
  })
  @IsOptional()
  @IsIn(['CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'INSURANCE'])
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'Payment due within 30 days' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiProperty({ type: [InvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}
