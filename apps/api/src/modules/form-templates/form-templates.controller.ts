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
import { FormTemplatesService } from './form-templates.service';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@ApiTags('form-templates')
@Controller('form-templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FormTemplatesController {
  constructor(private formTemplatesService: FormTemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all form templates with pagination and filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.formTemplatesService.findAll(req.user.practiceId, {
      search,
      category,
      status,
      page,
      pageSize,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get form template by ID' })
  async findById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.formTemplatesService.findById(id, req.user.practiceId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new form template' })
  async create(@Req() req: AuthenticatedRequest, @Body() data: any) {
    return this.formTemplatesService.create(req.user.practiceId, req.user.sub, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update form template' })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.formTemplatesService.update(id, req.user.practiceId, data);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate form template' })
  async duplicate(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.formTemplatesService.duplicate(id, req.user.practiceId, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete form template' })
  async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.formTemplatesService.delete(id, req.user.practiceId);
  }
}
