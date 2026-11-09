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
export interface IPaginate<T> {
  meta: {
    current: number;
    pageSize: number;
    pages:number;
    total: number;
  }
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