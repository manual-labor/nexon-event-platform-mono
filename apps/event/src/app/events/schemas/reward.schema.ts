import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Types } from 'mongoose';

export enum RewardType {
  POINT = 'POINT',       // 포인트
  ITEM = 'ITEM',         // 아이템
  COUPON = 'COUPON',     // 쿠폰
  CASH = 'CASH',         // 현금/캐시
  CUSTOM = 'CUSTOM',     // 기타
}

export enum RewardHistoryStatus {
  PENDING = 'PENDING',    // 확인 중
  SUCCESS = 'SUCCESS',    // 보상 성공
  FAILURE = 'FAILURE',    // 보상 실패
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
export class RewardHistory extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Reward', required: true })
  rewardId!: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(RewardHistoryStatus), required: true, default: RewardHistoryStatus.PENDING })
  status!: RewardHistoryStatus;

  @Prop({ type: Date, default: null })
  rewardAt?: Date | null; // 보상 획득 시간 (성공 시)

  createdAt!: Date;
  updatedAt!: Date;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
export type RewardDocument = Reward & Document;

export const RewardHistorySchema = SchemaFactory.createForClass(RewardHistory);
export type RewardHistoryDocument = RewardHistory & Document;
