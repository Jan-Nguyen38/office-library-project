import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument} from 'mongoose';
export type TemplateDocument = HydratedDocument<Template>;

@Schema({ timestamps: true})
export class Template {
  @Prop({ required: true }) name: string; 
  @Prop({ required: true }) category: string;
  @Prop({ required: true }) filePath: string;
  @Prop() description: string;
  @Prop([String]) tags: string[];
  @Prop() thumbnail: string;
  @Prop() searchText: string;

}
export const TemplateSchema = SchemaFactory.createForClass(Template);