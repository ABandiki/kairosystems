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

  @Get('analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get system-wide analytics' })
  async getAnalytics() {
    return this.superAdminService.getAnalytics();
  }

  @Get('revenue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get revenue overview' })
  async getRevenueOverview() {
    return this.superAdminService.getRevenueOverview();
  }

  @Get('activity-log')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get super admin activity log' })
  async getActivityLog(
    @Query('practiceId') practiceId?: string,
    @Query('action') action?: string,
    @Query('limit') limit?: number,
  ) {
    return this.superAdminService.getActivityLog(undefined, practiceId, limit);
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

  @Post('practices/:id/staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a staff member for a practice' })
  async createStaffMember(
    @Req() req: any,
    @Param('id') practiceId: string,
    @Body() data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: string;
      phone?: string;
    },
  ) {
    return this.superAdminService.createStaffMember(req.user.sub, practiceId, data);
  }

  @Post('practices/:id/notify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send notification to a practice' })
  async sendPracticeNotification(
    @Req() req: any,
    @Param('id') practiceId: string,
    @Body() data: { title: string; message: string },
  ) {
    return this.superAdminService.sendPracticeNotification(req.user.sub, practiceId, data);
  }

  @Post('broadcast')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Broadcast notification to all practices' })
  async broadcastNotification(
    @Req() req: any,
    @Body() data: { title: string; message: string },
  ) {
    return this.superAdminService.broadcastNotification(req.user.sub, data);
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
      subscriptionStartDate?: string;
      subscriptionEndDate?: string;
      isTrial?: boolean;
      trialEndsAt?: string | null;
    },
  ) {
    const processedData: any = { ...data };
    if (data.subscriptionStartDate) processedData.subscriptionStartDate = new Date(data.subscriptionStartDate);
    if (data.subscriptionEndDate) processedData.subscriptionEndDate = new Date(data.subscriptionEndDate);
    if (data.trialEndsAt) processedData.trialEndsAt = new Date(data.trialEndsAt);
    if (data.trialEndsAt === null) processedData.trialEndsAt = null;

    return this.superAdminService.updatePracticeSubscription(
      req.user.sub,
      practiceId,
      processedData,
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

  @Put('practices/bulk/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk activate/deactivate practices' })
  async bulkUpdateStatus(
    @Req() req: any,
    @Body() data: { practiceIds: string[]; isActive: boolean },
  ) {
    return this.superAdminService.bulkUpdatePracticeStatus(
      req.user.sub,
      data.practiceIds,
      data.isActive,
    );
  }

  @Put('practices/bulk/extend-trial')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk extend trials' })
  async bulkExtendTrials(
    @Req() req: any,
    @Body() data: { practiceIds: string[]; days: number },
  ) {
    return this.superAdminService.bulkExtendTrials(
      req.user.sub,
      data.practiceIds,
      data.days,
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

  @Put('devices/:id/revoke')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a device' })
  async revokeDevice(
    @Req() req: any,
    @Param('id') deviceId: string,
    @Body() data: { reason?: string },
  ) {
    return this.superAdminService.revokeDevice(req.user.sub, deviceId, data.reason);
  }

  @Put('staff/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a staff member' })
  async updateStaffMember(
    @Req() req: any,
    @Param('id') userId: string,
    @Body() data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: string;
      isActive?: boolean;
      phone?: string;
    },
  ) {
    return this.superAdminService.updateStaffMember(req.user.sub, userId, data);
  }

  @Put('staff/:id/reset-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @SkipDeviceCheck()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset a staff member password' })
  async resetStaffPassword(
    @Req() req: any,
    @Param('id') userId: string,
    @Body() data: { password: string },
  ) {
    return this.superAdminService.resetStaffPassword(req.user.sub, userId, data.password);
  }
}
