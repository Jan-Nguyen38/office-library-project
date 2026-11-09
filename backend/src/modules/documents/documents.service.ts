import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { UserDoc } from './schemas/user-doc.schema';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TemplatesService } from '../templates/templates.service';
import { randomUUID } from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const HTMLtoDOCX = require('html-to-docx');

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(UserDoc.name) private readonly userDocModel: Model<UserDoc>,
    private readonly templatesService: TemplatesService,
  ) {}
  async create(dto: CreateDocumentDto) {
    const template = await this.templatesService.findOne(dto.templateId);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    const {html} = await this.templatesService.getContent(dto.templateId);
    const doc = await this.userDocModel.create({
      title: template.name,
      templateId: template._id,
      content: html});
    return { _id: doc._id };
  }

  findAll() {
    return this.userDocModel
    .find()
    .select('-content')
    .sort({updatedAt: -1});
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('Document not found');
    const doc = await this.userDocModel.findById(id);
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  
  }

  async update(id: string, dto: UpdateDocumentDto) {
    const doc = await this.findOne(id);
    if (!doc) throw new NotFoundException('Document not found');

    return this.userDocModel.findByIdAndUpdate(id, dto, { new: true });
  }
  async buildDocs(id: string) {
    const doc = await this.findOne(id);
    if (!doc) throw new NotFoundException('Document not found');
    const buffer: Buffer = await HTMLtoDOCX(doc.content || '<p></p>', null, {
      font:'Times New Roman',
      fontSize: 26,
    });
    return {buffer, filename: `${doc.title}.docx`};
  }

  download(id: string) {
    return `This action downloads a #${id} document`;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.userDocModel.deleteOne({_id: id});
    return {_id: id};
  }
  async share(id: string) {
    const doc = await this.findOne(id); // 400/404
    if (doc.shareId) return { shareId: doc.shareId }; // đã chia sẻ: trả mã cũ
    const shareId = randomUUID();
    await this.userDocModel.updateOne({ _id: id }, { shareId }, { timestamps: false });
    return { shareId };
  }

  async unshare(id: string) {
    await this.findOne(id);
    await this.userDocModel.updateOne({ _id: id }, { $unset: { shareId: 1 } }, { timestamps: false });
    return { _id: id };
  }

  async findShared(shareId: string) {
    const doc = await this.userDocModel
      .findOne({ shareId })
      .select('-_id title content updatedAt'); // không lộ _id, templateId cho người ngoài
    if (!doc) throw new NotFoundException("The shared link isn't existed or recalled ")
    return doc;
  }
}
