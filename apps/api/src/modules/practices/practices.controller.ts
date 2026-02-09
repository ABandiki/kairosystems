import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PracticesService } from './practices.service';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@ApiTags('practices')
@Controller('practices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PracticesController {
  constructor(private practicesService: PracticesService) {}

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
}
