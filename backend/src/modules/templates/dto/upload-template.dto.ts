import { IsNotEmpty, IsOptional, IsString } from "class-validator";

// Multipart fields sent by the frontend form; the files themselves come through the interceptor
export class UploadTemplateDto {
    @IsNotEmpty({ message: 'Template name is required' })
    name: string;

    @IsNotEmpty({ message: 'Template category is required' })
    category: string;

    @IsOptional()
    @IsString()
    description?: string;

    // Comma-separated, e.g. "hợp đồng,tuyển dụng"
    @IsOptional()
    @IsString()
    tags?: string;
}
