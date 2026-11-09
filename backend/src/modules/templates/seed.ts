// src/templates/seed.ts
import { CreateTemplateDto } from './dto/create-template.dto';

export const SEED_TEMPLATES: CreateTemplateDto[] = [
  {
    name: 'Đơn xin nghỉ phép',
    category: 'Nhân sự',
    description: 'Mẫu đơn xin nghỉ phép dành cho nhân viên',
    tags: ['nghỉ phép', 'đơn từ'],
    filePath: 'templates/don-xin-nghi-phep.docx',
    thumbnail: 'thumbnails/don-xin-nghi-phep.png',
  },
  {
    name: 'Hợp đồng lao động',
    category: 'Nhân sự',
    description: 'Hợp đồng lao động có thời hạn giữa công ty và người lao động',
    tags: ['hợp đồng', 'tuyển dụng'],
    filePath: 'templates/hop-dong-lao-dong.docx',
    thumbnail: 'thumbnails/hop-dong-lao-dong.png',
  },
  {
    name: 'Biên bản cuộc họp',
    category: 'Hành chính',
    description: 'Ghi lại thành phần, nội dung và kết luận cuộc họp',
    tags: ['biên bản', 'họp'],
    filePath: 'templates/bien-ban-cuoc-hop.docx',
    thumbnail: 'thumbnails/bien-ban-cuoc-hop.png',
  },
  {
    name: 'Báo cáo công việc tuần',
    category: 'Hành chính',
    description: 'Báo cáo tiến độ công việc hàng tuần của nhân viên',
    tags: ['báo cáo', 'công việc'],
    filePath: 'templates/bao-cao-cong-viec-tuan.docx',
    thumbnail: 'thumbnails/bao-cao-cong-viec-tuan.png',
  },
  {
    name: 'Thư mời sự kiện',
    category: 'Hành chính',
    description: 'Thư mời các bên tham gia một sự kiện hoặc hoạt động',
    tags: ['thư', 'mời'],
    filePath: 'templates/thu-moi-su-kien.docx',
    thumbnail: 'thumbnails/thu-moi-su-kien.png',
  },
  {
    name: 'Báo giá dịch vụ',
    category: 'Hành chính',
    description: 'Mẫu báo giá dịch vụ dành cho khách hàng',
    tags: ['báo giá', 'dịch vụ'],
    filePath: 'templates/bao-gia-dich-vu.docx',
    thumbnail: 'thumbnails/bao-gia-dich-vu.png',
  },
  {
    name: 'CV xin việc',
    category: 'Nhân sự',
    description: 'Mẫu CV xin việc chuyên nghiệp dành cho ứng viên',
    tags: ['cv', 'xin việc', 'resume'],
    filePath: 'templates/cv-xin-viec.docx',
    thumbnail: 'thumbnails/cv-xin-viec.png',
  }
];
