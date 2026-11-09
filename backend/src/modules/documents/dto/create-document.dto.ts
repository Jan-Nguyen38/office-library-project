import { IsMongoId } from 'class-validator';
export class CreateDocumentDto {
  @IsMongoId({ message: 'invalid templateId' })
  templateId: string;
}