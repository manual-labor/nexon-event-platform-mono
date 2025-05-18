import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum EventStatus {
  UPCOMING = 'UPCOMING',     // 진행 예정
  ONGOING = 'ONGOING',       // 진행 중
  ENDED = 'ENDED',           // 진행 종료
  CANCELED = 'CANCELED',     // 취소됨
}

export enum EventConditionType {
  PARTICIPATION_VERIFICATION = 'PARTICIPATION_VERIFICATION',       // 참여 인증
  CONSECUTIVE_ATTENDANCE = 'CONSECUTIVE_ATTENDANCE',  // 연속 출석
  INVITE_FRIEND = 'INVITE_FRIEND',    // 친구 초대
}

@Schema({ timestamps: true })
export class EventCondition {
  @Prop({ type: String, enum: EventConditionType, required: true })
  type!: EventConditionType;

  @Prop({ required: true })
  value!: number;

  @Prop()
  description!: string;
}

const EventConditionSchema = SchemaFactory.createForClass(EventCondition);
EventConditionSchema.set('_id', false);

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  title!: string;

  @Prop()
  description!: string;

  @Prop({ type: String, enum: EventStatus, default: EventStatus.UPCOMING })
  status!: EventStatus;

  @Prop({ type: Date, required: true })
  startDate!: Date;

  @Prop({ type: Date, required: true })
  endDate!: Date;

  @Prop({ type: EventConditionSchema, default: null })
  condition!: EventCondition;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  updatedBy!: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);export type EventDocument = Event & Document;
