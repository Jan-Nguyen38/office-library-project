import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { TemplatesService, UploadedFile } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { UploadTemplateDto } from './dto/upload-template.dto';
import { Query } from '@nestjs/common';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  create(@Body() dto: CreateTemplateDto) {
    return this.templatesService.create(dto);
  }

  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }], {
      // No dest/storage: Nest keeps files in memory, so nothing hits disk if validation fails
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const ok = file.fieldname === 'file'
          ? file.mimetype === DOCX_MIME || file.originalname.toLowerCase().endsWith('.docx')
          : file.mimetype.startsWith('image/');
        cb(ok ? null : new BadRequestException(`Invalid file type for ${file.fieldname}`), ok);
      },
    }),
  )
  upload(
    @Body() dto: UploadTemplateDto,
    @UploadedFiles() files: { file?: UploadedFile[]; thumbnail?: UploadedFile[] },
  ) {
    if (!files?.file?.[0]) throw new BadRequestException('Template DOCX file is required');
    return this.templatesService.upload(dto, files.file[0], files.thumbnail?.[0]);
  }

  @Get()
  findAll(
    @Query() query: Record<string, string>,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,) {    
    return this.templatesService.findAll(query, +current || 1, +pageSize || 8);
  }

  @Get('categories')
  findCategories() {
    return this.templatesService.findCategories();
  }

  @Get('categories/counts')
  countByCategory(@Query('q') q?: string) {
    return this.templatesService.countByCategory(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Get(':id/content')
  getContent(@Param('id') id: string) {
    return this.templatesService.getContent(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTemplateDto: UpdateTemplateDto) {
    return this.templatesService.update(+id, updateTemplateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.templatesService.remove(+id);
  }
}
