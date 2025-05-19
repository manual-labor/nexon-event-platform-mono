import { IsDate, IsMongoId, IsNumber } from 'class-validator';

export class AttendanceResponseDto {
  @IsMongoId()
  id!: string;

  @IsMongoId()
  userId!: string;

  @IsDate()
  attendanceDate!: Date;

  @IsNumber()
  consecutiveDays!: number;

  @IsDate()
  createdAt?: Date;
} 