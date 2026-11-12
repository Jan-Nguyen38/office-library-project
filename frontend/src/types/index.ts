export interface ITemplate {
    _id: string;
  name: string;
  category: string;
  filePath: string;
  description?: string;
  tags?: string[];
  thumbnail?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
// Shape returned by GET /templates
export interface IPaginate<T> {
  total: number;
  results: T[];
}
export interface IUserDoc {
    _id: string;
  title: string;
  templateId: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}