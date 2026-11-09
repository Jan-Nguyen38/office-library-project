import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTemplateDto {
    @IsNotEmpty({ message: 'Template name is required' })
    name: string;

    @IsNotEmpty({ message: 'Template category is required' })
    category: string;

    @IsNotEmpty({ message: 'Template file path is required' })
    filePath: string;

    @IsOptional()
    description?: string;

    @IsOptional()
    @IsArray()
    @IsString({each: true})
    tags?: string[]

    @IsOptional()
    thumbnail?: string;
}
