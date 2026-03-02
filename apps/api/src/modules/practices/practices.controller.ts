import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  SetMetadata,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PracticesService } from './practices.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { SKIP_TRIAL_CHECK_KEY } from '../auth/guards/trial.guard';

@ApiTags('practices')
@Controller('practices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PracticesController {
  constructor(
    private practicesService: PracticesService,
    private prisma: PrismaService,
  ) {}

  @Get('trial-status')
  @SetMetadata(SKIP_TRIAL_CHECK_KEY, true)
  @ApiOperation({ summary: 'Get trial status for current practice' })
  async getTrialStatus(@Req() req: AuthenticatedRequest) {
    const practice = await this.prisma.practice.findUnique({
      where: { id: req.user.practiceId },
      select: {
        isTrial: true,
        trialEndsAt: true,
        isActive: true,
        subscriptionTier: true,
        name: true,
      },
    });

    if (!practice) {
      return { isTrial: false, trialExpired: false };
    }

    const now = new Date();
    const trialExpired = practice.isTrial && practice.trialEndsAt ? now > practice.trialEndsAt : false;
    const trialEndsAt = practice.trialEndsAt;
    const hoursRemaining = trialEndsAt ? Math.max(0, (trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60)) : 0;

    return {
      practiceName: practice.name,
      isTrial: practice.isTrial,
      trialEndsAt,
      trialExpired,
      hoursRemaining: Math.round(hoursRemaining * 10) / 10,
      subscriptionTier: practice.subscriptionTier,
      isActive: practice.isActive,
    };
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current practice details' })
  async getCurrent(@Req() req: AuthenticatedRequest) {
    return this.practicesService.findById(req.user.practiceId);
  }

  @Put('current')
  @ApiOperation({ summary: 'Update current practice details' })
  async updateCurrent(@Req() req: AuthenticatedRequest, @Body() data: any) {
    return this.practicesService.update(req.user.practiceId, data);
  }

  @Put('current/opening-hours')
  @ApiOperation({ summary: 'Update practice opening hours' })
  async updateOpeningHours(@Req() req: AuthenticatedRequest, @Body() data: any) {
    return this.practicesService.updateOpeningHours(
      req.user.practiceId,
      data.openingHours,
    );
  }

  @Get('current/pharmacies')
  @ApiOperation({ summary: 'Get practice pharmacies' })
  async getPharmacies(@Req() req: AuthenticatedRequest) {
    return this.practicesService.getPharmacies(req.user.practiceId);
  }

  @Post('current/pharmacies')
  @ApiOperation({ summary: 'Add a pharmacy' })
  async createPharmacy(@Req() req: AuthenticatedRequest, @Body() data: any) {
    return this.practicesService.createPharmacy(req.user.practiceId, data);
  }

  @Get('current/rooms')
  @ApiOperation({ summary: 'Get practice rooms' })
  async getRooms(@Req() req: AuthenticatedRequest) {
    return this.practicesService.getRooms(req.user.practiceId);
  }

  @Post('current/rooms')
  @ApiOperation({ summary: 'Add a room' })
  async createRoom(@Req() req: AuthenticatedRequest, @Body() data: any) {
    return this.practicesService.createRoom(req.user.practiceId, data);
  }

  @Get('current/appointment-types')
  @ApiOperation({ summary: 'Get appointment type settings' })
  async getAppointmentTypes(@Req() req: AuthenticatedRequest) {
    return this.practicesService.getAppointmentTypes(req.user.practiceId);
  }

  @Post('current/appointment-types')
  @ApiOperation({ summary: 'Create appointment type settings' })
  async createAppointmentType(@Req() req: AuthenticatedRequest, @Body() data: any) {
    return this.practicesService.createAppointmentType(req.user.practiceId, data);
  }

  @Put('current/appointment-types/:id')
  @ApiOperation({ summary: 'Update appointment type settings' })
  async updateAppointmentType(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.practicesService.updateAppointmentType(
      id,
      req.user.practiceId,
      data,
    );
  }

  @Get('current/analytics')
  @ApiOperation({ summary: 'Get practice-level analytics and reports' })
  async getAnalytics(@Req() req: AuthenticatedRequest) {
    return this.practicesService.getAnalytics(req.user.practiceId);
  }
}
