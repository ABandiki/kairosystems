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
import { TierGuard } from '../auth/guards/tier.guard';
import { RequireTier } from '../auth/decorators/tier.decorator';
import { FormSubmissionsService } from './form-submissions.service';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@ApiTags('form-submissions')
@Controller('form-submissions')
@UseGuards(JwtAuthGuard, TierGuard)
@RequireTier('PROFESSIONAL', 'CUSTOM')
@ApiBearerAuth()
export class FormSubmissionsController {
  constructor(private formSubmissionsService: FormSubmissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all form submissions with pagination and filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'templateId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('search') search?: string,
    @Query('patientId') patientId?: string,
    @Query('templateId') templateId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.formSubmissionsService.findAll(req.user.practiceId, {
      search,
      patientId,
      templateId,
      startDate,
      endDate,
      page,
      pageSize,
    });
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get form submissions for a specific patient' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async findByPatient(
    @Req() req: AuthenticatedRequest,
    @Param('patientId') patientId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.formSubmissionsService.findByPatient(
      patientId,
      req.user.practiceId,
      { page, pageSize },
    );
  }

  @Get('template/:templateId/stats')
  @ApiOperation({ summary: 'Get submission statistics for a form template' })
  async getTemplateStats(
    @Req() req: AuthenticatedRequest,
    @Param('templateId') templateId: string,
  ) {
    return this.formSubmissionsService.getTemplateStats(
      templateId,
      req.user.practiceId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get form submission by ID' })
  async findById(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.formSubmissionsService.findById(id, req.user.practiceId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new form submission' })
  async create(@Req() req: AuthenticatedRequest, @Body() data: any) {
    return this.formSubmissionsService.create(
      req.user.practiceId,
      req.user.sub,
      data,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update form submission' })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.formSubmissionsService.update(id, req.user.practiceId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete form submission' })
  async delete(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.formSubmissionsService.delete(id, req.user.practiceId);
  }
}
