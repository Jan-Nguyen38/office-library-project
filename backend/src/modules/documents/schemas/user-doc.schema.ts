import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Template } from '../../templates/schemas/template.schema';

export type UserDocDocument = HydratedDocument<UserDoc>;

@Schema({ timestamps: true })
export class UserDoc {
    @Prop({ required: true }) title: string;
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: Template.name }) 
    templateId: mongoose.Types.ObjectId;
    @Prop({type: String, default: '' }) content: string;
    @Prop({ unique: true, sparse: true }) shareId?: string;
}

export const UserDocSchema = SchemaFactory.createForClass(UserDoc);
