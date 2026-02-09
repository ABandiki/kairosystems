import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DevicesService } from './devices.service';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@ApiTags('devices')
@Controller('devices')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @Get()
  @Roles('PRACTICE_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get all devices for the practice' })
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.devicesService.findAllForPractice(req.user.practiceId);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new device (pending approval)' })
  async registerDevice(
    @Req() req: AuthenticatedRequest,
    @Body() data: {
      deviceFingerprint: string;
      deviceName: string;
      deviceType: string;
    },
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string;
    const userAgent = req.headers['user-agent'];

    return this.devicesService.registerDevice(req.user.practiceId, {
      ...data,
      ipAddress,
      userAgent,
    });
  }

  @Put(':id/approve')
  @Roles('PRACTICE_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Approve a pending device' })
  async approveDevice(
    @Req() req: AuthenticatedRequest,
    @Param('id') deviceId: string,
  ) {
    return this.devicesService.approveDevice(
      deviceId,
      req.user.practiceId,
      req.user.sub,
    );
  }

  @Put(':id/revoke')
  @Roles('PRACTICE_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Revoke device access' })
  async revokeDevice(
    @Req() req: AuthenticatedRequest,
    @Param('id') deviceId: string,
    @Body() data: { reason?: string },
  ) {
    return this.devicesService.revokeDevice(
      deviceId,
      req.user.practiceId,
      data.reason,
    );
  }

  @Delete(':id')
  @Roles('PRACTICE_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a device' })
  async deleteDevice(
    @Req() req: AuthenticatedRequest,
    @Param('id') deviceId: string,
  ) {
    return this.devicesService.deleteDevice(deviceId, req.user.practiceId);
  }
}
