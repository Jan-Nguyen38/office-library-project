import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import type { Response } from 'express';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.create(createDocumentDto);
  }

  @Get()
  findAll() {
    return this.documentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    return this.documentsService.update(id, updateDocumentDto);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const { buffer, filename } = await this.documentsService.buildDocs(id);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Content-Length': buffer.length,
    })
    return res.send(buffer);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }

  @Get('shared/:shareId') // đặt TRÊN @Get(':id'), như /templates/categories ở B2
  findShared(@Param('shareId') shareId: string) {
    return { shareId, title: 'giả', content: '<p>giả</p>' };
  }

  @Post(':id/share')
  share(@Param('id') id: string) {
    return { shareId: 'gia-' + id };
  }

  
}
