import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserProvider, UserRole } from '../../interfaces/user.interface';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  nickname!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ type: String })
  password?: string | null;

  @Prop({ type: String, enum: Object.values(UserProvider), default: UserProvider.LOCAL })
  provider!: UserProvider;

  @Prop({ type: String, enum: Object.values(UserRole), default: UserRole.USER })
  role!: UserRole;

  @Prop({ default: Date.now })
  lastLogin!: Date;
  
  // timestamps: true를 사용했으므로 이러한 필드들이 자동으로 생성됩니다
  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User); 