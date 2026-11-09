import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateDocumentDto  {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'Document title cannot be empty' })
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

}
