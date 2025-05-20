import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  USER = 'USER',
  OPERATOR = 'OPERATOR',
  AUDITOR = 'AUDITOR',
  ADMIN = 'ADMIN',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  nickname!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ type: String })
  password?: string | null;

  @Prop({ default: 'local' })
  provider!: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Prop({ default: Date.now })
  lastLogin!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ provider: 1 });
UserSchema.index({ createdAt: -1 });

export type UserDocument = User & Document; 