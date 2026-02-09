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
import { StaffService } from './staff.service';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@ApiTags('staff')
@Controller('staff')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Get()
  @ApiOperation({ summary: 'Get all staff members' })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  async findAll(@Req() req: AuthenticatedRequest, @Query('role') role?: UserRole) {
    return this.staffService.findAll(req.user.practiceId, { role });
  }

  @Get('clinicians')
  @ApiOperation({ summary: 'Get all clinicians (GPs, Nurses, HCAs)' })
  async getClinicians(@Req() req: AuthenticatedRequest) {
    return this.staffService.getClinicians(req.user.practiceId);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get staff usage statistics for billing' })
  async getStaffUsage(@Req() req: AuthenticatedRequest) {
    return this.staffService.getStaffUsage(req.user.practiceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get staff member by ID' })
  async findById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.staffService.findById(id, req.user.practiceId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new staff member' })
  async create(@Req() req: AuthenticatedRequest, @Body() data: any) {
    return this.staffService.create(req.user.practiceId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update staff member details' })
  async update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() data: any) {
    return this.staffService.update(id, req.user.practiceId, data);
  }

  @Put(':id/working-hours')
  @ApiOperation({ summary: 'Update staff working hours' })
  async updateWorkingHours(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.staffService.updateWorkingHours(id, req.user.practiceId, data.workingHours);
  }

  @Put(':id/signature')
  @ApiOperation({ summary: 'Update staff signature' })
  async updateSignature(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: { signature: string },
  ) {
    return this.staffService.updateSignature(id, req.user.practiceId, data.signature);
  }
}
