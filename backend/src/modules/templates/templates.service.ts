import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { Template } from './schemas/template.schema';
import { isValidObjectId, Model } from 'mongoose';
import { removeAccents } from '../../helpers/utils';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { join } from 'path/win32';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import * as mammoth from 'mammoth';
import { SEED_TEMPLATES } from './seed';
import { UploadTemplateDto } from './dto/upload-template.dto';

// Subset of multer's file object (memory storage) that we use
export interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}
@Injectable()
export class TemplatesService implements OnModuleInit {
  constructor(@InjectModel(Template.name) private templateModel: Model<Template>) {}
  async onModuleInit() {
    const count = await this.templateModel.countDocuments();
    if (count > 0) return; // đã có dữ liệu thì không seed lại
    for (const t of SEED_TEMPLATES) await this.create(t);
  }
  async create(dto: CreateTemplateDto) {
    const searchText = removeAccents([dto.name, dto.description, ...(dto.tags ?? [])].filter(Boolean).join(' '));
    const template = await this.templateModel.create({...dto, searchText});
    return {'_id': template._id};
  }

  async upload(dto: UploadTemplateDto, file: UploadedFile, thumbnail?: UploadedFile) {
    const filePath = await this.saveFile('templates', file);
    const thumbnailPath = thumbnail ? await this.saveFile('thumbnails', thumbnail) : undefined;
    const tags = dto.tags?.split(',').map((t) => t.trim()).filter(Boolean);
    return this.create({
      name: dto.name,
      category: dto.category,
      description: dto.description,
      tags,
      filePath,
      thumbnail: thumbnailPath,
    });
  }

  // Writes under public/<folder> and returns the path relative to public/, matching the seed data
  private async saveFile(folder: 'templates' | 'thumbnails', file: UploadedFile) {
    const dir = join(process.cwd(), 'public', folder);
    await mkdir(dir, { recursive: true });
    const name = `${randomUUID()}${extname(file.originalname).toLowerCase()}`;
    await writeFile(join(dir, name), file.buffer);
    return `${folder}/${name}`;
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    delete filter.current;
    delete filter.pageSize;
    if (filter.q){
      const keywords = removeAccents(String(filter.q)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');;
      filter.searchText = { $regex: keywords, $options: 'i' };
      delete filter.q;
    }

    const total = await this.templateModel.countDocuments(filter);
    const results = await this.templateModel.
    find(filter).
    skip((current - 1) * pageSize).
    limit(pageSize).
    sort(sort as any).exec();
    return { total, results };
  }

  findCategories() {
    return this.templateModel.distinct('category');
  }

  

  async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid template ID');
    }
    const template = await this.templateModel.findById(id);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async getContent(id: string) {
    const template = await this.findOne(id);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    const fullPath =  join(process.cwd(), 'public', template.filePath);
    try {
      const buffer = await readFile(fullPath);
      const content = await mammoth.convertToHtml({ buffer });
      return { html: content.value}
    } catch {
      throw new NotFoundException('Failed to load template content');
    }
    
  }

  update(id: number, updateTemplateDto: UpdateTemplateDto) {
    return `This action updates a #${id} template`;
  }

  remove(id: number) {
    return `This action removes a #${id} template`;
  }
}
