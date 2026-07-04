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
import { TraditionalMedicineService } from './traditional-medicine.service';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { CreateTraditionalMedicineDto } from './dto/create-traditional-medicine.dto';
import { UpdateTraditionalMedicineDto } from './dto/update-traditional-medicine.dto';

@ApiTags('traditional-medicine')
@Controller('traditional-medicine')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TraditionalMedicineController {
  constructor(private traditionalMedicineService: TraditionalMedicineService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all traditional medicine records with pagination and filters',
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'hasInteractionRisk', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('patientId') patientId?: string,
    @Query('hasInteractionRisk') hasInteractionRisk?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.traditionalMedicineService.findAll(req.user.practiceId, {
      search,
      category,
      status,
      patientId,
      hasInteractionRisk,
      page,
      pageSize,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get traditional medicine statistics' })
  async getStats(@Req() req: AuthenticatedRequest) {
    return this.traditionalMedicineService.getStats(req.user.practiceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get traditional medicine record by ID' })
  async findById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.traditionalMedicineService.findById(id, req.user.practiceId);
  }

  @Post()
  @ApiOperation({ summary: 'Record traditional medicine use for a patient' })
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreateTraditionalMedicineDto,
  ) {
    return this.traditionalMedicineService.create(
      req.user.practiceId,
      req.user.sub,
      data,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update traditional medicine record' })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateTraditionalMedicineDto,
  ) {
    return this.traditionalMedicineService.update(id, req.user.practiceId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete traditional medicine record' })
  async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.traditionalMedicineService.delete(id, req.user.practiceId);
  }
}
