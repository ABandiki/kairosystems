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
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all documents with pagination and filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('patientId') patientId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.documentsService.findAll(req.user.practiceId, {
      search,
      type,
      patientId,
      page,
      pageSize,
    });
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get all documents for a specific patient' })
  async findByPatient(
    @Req() req: AuthenticatedRequest,
    @Param('patientId') patientId: string,
  ) {
    return this.documentsService.findByPatient(patientId, req.user.practiceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  async findById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.documentsService.findById(id, req.user.practiceId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new document record (metadata only)' })
  async create(@Req() req: AuthenticatedRequest, @Body() data: CreateDocumentDto) {
    return this.documentsService.create(
      req.user.practiceId,
      req.user.sub,
      data,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a document' })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateDocumentDto,
  ) {
    return this.documentsService.update(id, req.user.practiceId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.documentsService.delete(id, req.user.practiceId);
  }
}
