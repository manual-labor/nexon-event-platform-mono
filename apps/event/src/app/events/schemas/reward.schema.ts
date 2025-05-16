import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum RewardType {
  POINT = 'POINT',       // 포인트
  ITEM = 'ITEM',         // 아이템
  COUPON = 'COUPON',     // 쿠폰
  CASH = 'CASH',         // 현금/캐시
  CUSTOM = 'CUSTOM',     // 기타
}

@Schema({ timestamps: true })
export class Reward {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', required: true })
  eventId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: String, enum: RewardType, required: true })
  type!: RewardType;

  @Prop({ required: true })
  quantity!: number;

  @Prop()
  description!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy!: string;
}

@Schema({ timestamps: true })
export class RewardHistory {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', required: true })
  eventId!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Reward', required: true })
  rewardId!: string;

  @Prop({ default: false })
  claimed!: boolean;

  @Prop({ type: Date, default: null })
  claimedAt!: Date;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
export type RewardDocument = Reward & Document;

export const RewardHistorySchema = SchemaFactory.createForClass(RewardHistory);export type RewardHistoryDocument = RewardHistory & Document;
