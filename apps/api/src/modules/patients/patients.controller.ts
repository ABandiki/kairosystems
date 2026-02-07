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
import { PatientsService } from './patients.service';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@ApiTags('patients')
@Controller('patients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all patients with pagination and filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'registeredGpId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('registeredGpId') registeredGpId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.patientsService.findAll(req.user.practiceId, {
      search,
      status,
      registeredGpId,
      page,
      pageSize,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get patient statistics for dashboard' })
  async getStats(@Req() req: AuthenticatedRequest) {
    return this.patientsService.getDashboardStats(req.user.practiceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  async findById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.patientsService.findById(id, req.user.practiceId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new patient' })
  async create(@Req() req: AuthenticatedRequest, @Body() data: any) {
    return this.patientsService.create(req.user.practiceId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update patient details' })
  async update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() data: any) {
    return this.patientsService.update(id, req.user.practiceId, data);
  }

  @Post(':id/alerts')
  @ApiOperation({ summary: 'Add alert to patient' })
  async addAlert(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() data: any) {
    return this.patientsService.addAlert(id, req.user.practiceId, data);
  }
}
