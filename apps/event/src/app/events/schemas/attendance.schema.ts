import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId!: string;  // 출석한 사용자

  @Prop({ type: Date, required: true })
  attendanceDate!: Date;  // 출석 일자 (날짜만)

  @Prop({ default: 1 })
  consecutiveDays!: number;  // 현재 연속 출석 일수
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

AttendanceSchema.index({ userId: 1 });
AttendanceSchema.index({ attendanceDate: -1 });
AttendanceSchema.index({ userId: 1, attendanceDate: -1 }, { unique: true });
AttendanceSchema.index({ consecutiveDays: -1 });

export type AttendanceDocument = Attendance & Document; 