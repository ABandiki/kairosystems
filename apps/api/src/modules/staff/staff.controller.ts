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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { UpdateWorkingHoursDto } from './dto/update-working-hours.dto';
import { UpdateSignatureDto } from './dto/update-signature.dto';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@ApiTags('staff')
@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Get()
  @ApiOperation({ summary: 'Get all staff members' })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  async findAll(@Req() req: AuthenticatedRequest, @Query('role') role?: UserRole) {
    return this.staffService.findAll(req.user.practiceId, { role });
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get staff usage statistics for billing' })
  async getStaffUsage(@Req() req: AuthenticatedRequest) {
    return this.staffService.getStaffUsage(req.user.practiceId);
  }

  @Get('clinicians')
  @ApiOperation({ summary: 'Get all clinicians (GPs, Nurses, HCAs)' })
  async getClinicians(@Req() req: AuthenticatedRequest) {
    return this.staffService.getClinicians(req.user.practiceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get staff member by ID' })
  async findById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.staffService.findById(id, req.user.practiceId);
  }

  @Post()
  @Roles('PRACTICE_ADMIN', 'PRACTICE_MANAGER')
  @ApiOperation({ summary: 'Create a new staff member' })
  async create(@Req() req: AuthenticatedRequest, @Body() data: CreateStaffDto) {
    return this.staffService.create(req.user.practiceId, data);
  }

  @Put(':id')
  @Roles('PRACTICE_ADMIN', 'PRACTICE_MANAGER')
  @ApiOperation({ summary: 'Update staff member details' })
  async update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() data: UpdateStaffDto) {
    return this.staffService.update(id, req.user.practiceId, data);
  }

  @Put(':id/working-hours')
  @Roles('PRACTICE_ADMIN', 'PRACTICE_MANAGER')
  @ApiOperation({ summary: 'Update staff working hours' })
  async updateWorkingHours(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateWorkingHoursDto,
  ) {
    return this.staffService.updateWorkingHours(id, req.user.practiceId, data.hours);
  }

  @Put(':id/signature')
  @ApiOperation({ summary: 'Update staff signature' })
  async updateSignature(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateSignatureDto,
  ) {
    return this.staffService.updateSignature(id, req.user.practiceId, data.signature);
  }
}
