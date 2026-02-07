import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppointmentsService } from './appointments.service';
import { AppointmentStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get appointments with filters' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'clinicianId', required: false })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'status', required: false, isArray: true })
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('clinicianId') clinicianId?: string,
    @Query('patientId') patientId?: string,
    @Query('status') status?: AppointmentStatus[],
  ) {
    return this.appointmentsService.findAll(req.user.practiceId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      clinicianId,
      patientId,
      status: Array.isArray(status) ? status : status ? [status] : undefined,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get appointment statistics for dashboard' })
  async getStats(@Req() req: AuthenticatedRequest) {
    return this.appointmentsService.getDashboardStats(req.user.practiceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  async findById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.appointmentsService.findById(id, req.user.practiceId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  async create(@Req() req: AuthenticatedRequest, @Body() data: any) {
    return this.appointmentsService.create(req.user.practiceId, data);
  }

  @Put(':id/check-in')
  @ApiOperation({ summary: 'Mark patient as arrived' })
  async checkIn(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.appointmentsService.checkIn(id, req.user.practiceId);
  }

  @Put(':id/start')
  @ApiOperation({ summary: 'Start consultation' })
  async start(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.appointmentsService.startConsultation(id, req.user.practiceId);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Complete appointment' })
  async complete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.appointmentsService.complete(id, req.user.practiceId);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel appointment' })
  async cancel(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.appointmentsService.cancel(id, req.user.practiceId);
  }

  @Put(':id/dna')
  @ApiOperation({ summary: 'Mark as Did Not Attend' })
  async markDna(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.appointmentsService.markDna(id, req.user.practiceId);
  }
}
