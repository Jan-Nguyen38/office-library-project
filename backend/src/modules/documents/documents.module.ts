import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { UserDoc, UserDocSchema } from './schemas/user-doc.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplatesModule } from '../templates/templates.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserDoc.name, schema: UserDocSchema }]),
    TemplatesModule
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
