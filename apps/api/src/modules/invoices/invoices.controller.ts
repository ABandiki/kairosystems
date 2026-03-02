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
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TierGuard } from '../auth/guards/tier.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequireTier } from '../auth/decorators/tier.decorator';
import { InvoicesService } from './invoices.service';
import { BillingPinService } from './billing-pin.service';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@ApiTags('invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard, TierGuard)
@RequireTier('PROFESSIONAL', 'CUSTOM')
@ApiBearerAuth()
export class InvoicesController {
  constructor(
    private invoicesService: InvoicesService,
    private billingPinService: BillingPinService,
  ) {}

  // ==================== BILLING PIN ENDPOINTS ====================

  @Get('billing-pin/status')
  @ApiOperation({ summary: 'Check if billing PIN is configured' })
  async getBillingPinStatus(@Req() req: AuthenticatedRequest) {
    const hasPin = await this.billingPinService.hasPinSet(req.user.practiceId);
    const bypassRoles = ['PRACTICE_ADMIN', 'SUPER_ADMIN'];
    const canBypass =
      bypassRoles.includes(req.user.role) || (req.user as any).isSuperAdmin;
    return { hasPinSet: hasPin, canBypass };
  }

  @Post('billing-pin/verify')
  @ApiOperation({ summary: 'Verify billing PIN to unlock billing section' })
  async verifyBillingPin(
    @Req() req: AuthenticatedRequest,
    @Body() body: { pin: string },
  ) {
    const bypassRoles = ['PRACTICE_ADMIN', 'SUPER_ADMIN'];
    if (
      bypassRoles.includes(req.user.role) ||
      (req.user as any).isSuperAdmin
    ) {
      return { verified: true };
    }
    const verified = await this.billingPinService.verifyPin(
      req.user.practiceId,
      body.pin,
    );
    if (!verified) {
      throw new UnauthorizedException('Invalid billing PIN');
    }
    return { verified: true };
  }

  @Post('billing-pin/set')
  @UseGuards(RolesGuard)
  @Roles('PRACTICE_ADMIN')
  @ApiOperation({ summary: 'Set or update the billing PIN' })
  async setBillingPin(
    @Req() req: AuthenticatedRequest,
    @Body() body: { pin: string },
  ) {
    await this.billingPinService.setPin(
      req.user.practiceId,
      req.user.sub,
      body.pin,
    );
    return { success: true };
  }

  @Delete('billing-pin')
  @UseGuards(RolesGuard)
  @Roles('PRACTICE_ADMIN')
  @ApiOperation({ summary: 'Remove the billing PIN' })
  async removeBillingPin(@Req() req: AuthenticatedRequest) {
    await this.billingPinService.removePin(req.user.practiceId);
    return { success: true };
  }

  // ==================== INVOICE ENDPOINTS ====================

  @Get()
  @UseGuards(RolesGuard)
  @Roles('PRACTICE_ADMIN', 'PRACTICE_MANAGER', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Get all invoices with pagination and filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('patientId') patientId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.invoicesService.findAll(req.user.practiceId, {
      search,
      status,
      patientId,
      startDate,
      endDate,
      page,
      pageSize,
    });
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('PRACTICE_ADMIN', 'PRACTICE_MANAGER', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Get billing statistics' })
  async getStats(@Req() req: AuthenticatedRequest) {
    return this.invoicesService.getStats(req.user.practiceId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('PRACTICE_ADMIN', 'PRACTICE_MANAGER', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Get invoice by ID' })
  async findById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.invoicesService.findById(id, req.user.practiceId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('PRACTICE_ADMIN', 'PRACTICE_MANAGER', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Create a new invoice' })
  async create(@Req() req: AuthenticatedRequest, @Body() data: any) {
    return this.invoicesService.create(req.user.practiceId, req.user.sub, data);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('PRACTICE_ADMIN', 'PRACTICE_MANAGER')
  @ApiOperation({ summary: 'Update invoice' })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.invoicesService.update(id, req.user.practiceId, data);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('PRACTICE_ADMIN', 'PRACTICE_MANAGER')
  @ApiOperation({ summary: 'Delete invoice' })
  async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.invoicesService.delete(id, req.user.practiceId);
  }
}
