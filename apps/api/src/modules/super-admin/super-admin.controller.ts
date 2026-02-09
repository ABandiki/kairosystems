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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SkipDeviceCheck } from '../auth/decorators/skip-device-check.decorator';
import { SuperAdminService } from './super-admin.service';

@ApiTags('super-admin')
@Controller('super-admin')
export class SuperAdminController {
  constructor(private superAdminService: SuperAdminService) {}

  @Post('login')
  @SkipDeviceCheck()
  @ApiOperation({ summary: 'Super admin login' })
  async login(
    @Req() req: any,
    @Body() data: { email: string; password: string },
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'];
    return this.superAdminService.login(data.email, data.password, ipAddress);
  }

  @Get('practices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all practices' })
  async getAllPractices() {
    return this.superAdminService.getAllPractices();
  }

  @Get('practices/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get practice details' })
  async getPracticeDetails(@Req() req: any, @Param('id') practiceId: string) {
    return this.superAdminService.getPracticeDetails(practiceId, req.user.sub);
  }

  @Post('practices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new practice' })
  async createPractice(@Req() req: any, @Body() data: any) {
    return this.superAdminService.createPractice(req.user.sub, data);
  }

  @Post('practices/:id/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create initial admin for a practice' })
  async createPracticeAdmin(
    @Req() req: any,
    @Param('id') practiceId: string,
    @Body() data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
    },
  ) {
    return this.superAdminService.createPracticeAdmin(req.user.sub, practiceId, data);
  }

  @Put('practices/:id/subscription')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update practice subscription' })
  async updateSubscription(
    @Req() req: any,
    @Param('id') practiceId: string,
    @Body() data: {
      subscriptionTier?: string;
      maxStaffIncluded?: number;
      extraStaffCount?: number;
    },
  ) {
    return this.superAdminService.updatePracticeSubscription(
      req.user.sub,
      practiceId,
      data,
    );
  }

  @Put('practices/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate/deactivate a practice' })
  async setPracticeStatus(
    @Req() req: any,
    @Param('id') practiceId: string,
    @Body() data: { isActive: boolean },
  ) {
    return this.superAdminService.setPracticeActive(
      req.user.sub,
      practiceId,
      data.isActive,
    );
  }

  @Put('devices/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a device for any practice' })
  async approveDevice(@Req() req: any, @Param('id') deviceId: string) {
    return this.superAdminService.approveDevice(req.user.sub, deviceId);
  }

  @Get('activity-log')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get super admin activity log' })
  async getActivityLog(
    @Query('practiceId') practiceId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.superAdminService.getActivityLog(undefined, practiceId, limit);
  }
}
