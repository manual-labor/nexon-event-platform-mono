import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Friend {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  inviterId!: string;  // 초대한 사용자

  @Prop({ required: true })
  inviteeEmail!: string;  // 초대된 사용자 이메일

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  inviteeId!: string;  // 초대된 사용자 ID (가입 후)

  @Prop({ type: Date, default: null })
  registeredAt!: Date;  // 가입 일시

  @Prop({ default: false })
  isRegistered!: boolean;  // 가입 여부
}

export const FriendSchema = SchemaFactory.createForClass(Friend);
export type FriendDocument = Friend & Document; 