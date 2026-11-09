import { Module } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { Template, TemplateSchema } from './schemas/template.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [ MongooseModule.forFeature([{ name: Template.name, schema: TemplateSchema }])],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService]
})
export class TemplatesModule {}
