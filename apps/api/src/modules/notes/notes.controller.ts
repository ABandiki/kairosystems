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
import { NotesService } from './notes.service';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@ApiTags('notes')
@Controller('notes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notes with pagination and filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'noteType', required: false })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('search') search?: string,
    @Query('noteType') noteType?: string,
    @Query('patientId') patientId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.notesService.findAll(req.user.practiceId, {
      search,
      noteType,
      patientId,
      page,
      pageSize,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get note by ID' })
  async findById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.notesService.findById(id, req.user.practiceId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  async create(@Req() req: AuthenticatedRequest, @Body() data: any) {
    return this.notesService.create(req.user.practiceId, req.user.sub, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update note' })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.notesService.update(id, req.user.practiceId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete note' })
  async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.notesService.delete(id, req.user.practiceId);
  }
}
