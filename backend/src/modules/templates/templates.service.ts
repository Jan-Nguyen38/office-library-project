import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { Template } from './schemas/template.schema';
import { isValidObjectId, Model } from 'mongoose';
import { removeAccents } from '../../helpers/utils';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import * as mammoth from 'mammoth';
import { SEED_TEMPLATES } from './seed';
import { UploadTemplateDto } from './dto/upload-template.dto';

// Mammoth drops Word paragraph alignment. We prefix each aligned paragraph with an invisible
// marker run, then turn the marker into a text-align style on the block that contains it.
const WORD_ALIGN: Record<string, string> = { center: 'center', right: 'right', end: 'right', both: 'justify', distribute: 'justify' };
const MARK_START = '';
const MARK_END = '';

// transforms exists at runtime but is missing from mammoth's type definitions
type MammothNode = { type: string; value?: string; alignment?: string | null; children: MammothNode[] };
const transforms = (mammoth as unknown as {
  transforms: {
    paragraph: (fn: (p: MammothNode) => MammothNode) => unknown;
    getDescendantsOfType: (node: MammothNode, type: string) => MammothNode[];
  };
}).transforms;

const markAlignment = transforms.paragraph((p) => {
  const align = WORD_ALIGN[p.alignment ?? ''];
  // Empty paragraphs are dropped by mammoth; adding a marker would keep them
  const hasText = transforms.getDescendantsOfType(p, 'text').some((t) => t.value?.trim());
  if (!align || !hasText) return p;
  const marker = { type: 'run', verticalAlignment: 'baseline', children: [{ type: 'text', value: `${MARK_START}${align}${MARK_END}`, children: [] }] } as MammothNode;
  return { ...p, children: [marker, ...p.children] };
});

function applyAlignment(html: string) {
  return html
    .replace(
      new RegExp(`<(p|h[1-6]|li)>((?:<[^>]+>)*)${MARK_START}(center|right|justify)${MARK_END}`, 'g'),
      '<$1 style="text-align: $3">$2',
    )
    .replace(new RegExp(`${MARK_START}\\w+${MARK_END}`, 'g'), '');
}

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
    // Insert only the seed templates that are missing, so uploaded templates and existing IDs survive restarts
    for (const t of SEED_TEMPLATES) {
      await this.templateModel.updateOne(
        { filePath: t.filePath },
        { $setOnInsert: { ...t, searchText: this.searchTextOf(t) } },
        { upsert: true },
      );
    }
  }
  async create(dto: CreateTemplateDto) {
    const template = await this.templateModel.create({...dto, searchText: this.searchTextOf(dto)});
    return {'_id': template._id};
  }

  private searchTextOf(dto: CreateTemplateDto) {
    return removeAccents([dto.name, dto.description, ...(dto.tags ?? [])].filter(Boolean).join(' '));
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

  async findAll(query: Record<string, string>, current: number, pageSize: number) {
    // Only known keys become filters: passing aqp's filter through would let callers send
    // their own regexes (/^(a+)+$/) or filter on internal fields like filePath
    const { sort } = aqp(query);
    const filter: Record<string, unknown> = {};
    if (query.category) filter.category = String(query.category);
    if (query.q) filter.searchText = this.searchTextFilter(String(query.q));

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

  // Number of templates per category, matching the same keyword search as findAll
  async countByCategory(q?: string) {
    const match = q ? { searchText: this.searchTextFilter(q) } : {};
    const rows = await this.templateModel.aggregate<{ _id: string; count: number }>([
      { $match: match },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    return Object.fromEntries(rows.map((r) => [r._id, r.count])) as Record<string, number>;
  }

  private searchTextFilter(q: string) {
    const keywords = removeAccents(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return { $regex: keywords, $options: 'i' };
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
      const content = await mammoth.convertToHtml({ buffer }, {
        transformDocument: markAlignment as never,
        // Mammoth ignores underline unless mapped (e.g. "Độc lập - Tự do - Hạnh phúc")
        styleMap: ['u => u'],
      });
      return { html: applyAlignment(content.value) }
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
