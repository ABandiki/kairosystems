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
import { PrescriptionsService } from './prescriptions.service';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@ApiTags('prescriptions')
@Controller('prescriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PrescriptionsController {
  constructor(private prescriptionsService: PrescriptionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all prescriptions with pagination and filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'prescriberId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('patientId') patientId?: string,
    @Query('prescriberId') prescriberId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.prescriptionsService.findAll(req.user.practiceId, {
      search,
      type,
      status,
      patientId,
      prescriberId,
      page,
      pageSize,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get prescription statistics' })
  async getStats(@Req() req: AuthenticatedRequest) {
    return this.prescriptionsService.getStats(req.user.practiceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get prescription by ID' })
  async findById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.prescriptionsService.findById(id, req.user.practiceId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new prescription' })
  async create(@Req() req: AuthenticatedRequest, @Body() data: any) {
    return this.prescriptionsService.create(
      req.user.practiceId,
      req.user.sub,
      data,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a prescription' })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.prescriptionsService.update(id, req.user.practiceId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a prescription' })
  async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.prescriptionsService.delete(id, req.user.practiceId);
  }
}
