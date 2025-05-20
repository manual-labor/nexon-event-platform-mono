import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Friend {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  inviterId!: string;  // 초대한 사용자

  @Prop({ type: String, required: true })
  inviterEmail!: string;  // 초대한 사용자 이메일

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  inviteeId!: string;  // 초대된 사용자 ID (가입 후)

  @Prop({ type: String, required: true })
  inviteeEmail!: string;  // 초대된 사용자 이메일
}

export const FriendSchema = SchemaFactory.createForClass(Friend);

FriendSchema.index({ inviterId: 1 });
FriendSchema.index({ inviteeId: 1 });
FriendSchema.index({ inviterEmail: 1 });
FriendSchema.index({ inviteeEmail: 1 });
FriendSchema.index({ inviterId: 1, inviteeId: 1 }, { unique: true }); 
FriendSchema.index({ createdAt: -1 }); 

export type FriendDocument = Friend & Document; 