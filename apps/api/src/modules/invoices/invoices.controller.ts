import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvoicesService } from './invoices.service';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@ApiTags('invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all invoices with pagination and filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('patientId') patientId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.invoicesService.findAll(req.user.practiceId, {
      search,
      status,
      patientId,
      startDate,
      endDate,
      page,
      pageSize,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get billing statistics' })
  async getStats(@Req() req: AuthenticatedRequest) {
    return this.invoicesService.getStats(req.user.practiceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  async findById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.invoicesService.findById(id, req.user.practiceId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  async create(@Req() req: AuthenticatedRequest, @Body() data: any) {
    return this.invoicesService.create(req.user.practiceId, req.user.sub, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update invoice' })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.invoicesService.update(id, req.user.practiceId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete invoice' })
  async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.invoicesService.delete(id, req.user.practiceId);
  }
}
