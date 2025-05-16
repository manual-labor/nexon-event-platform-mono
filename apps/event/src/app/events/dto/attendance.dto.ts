import { IsString, IsNotEmpty, IsOptional, IsDate, IsMongoId, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class AttendanceRequestDto {
  // 출석 요청 시에는 특별한 파라미터가 필요 없음
  // 사용자 정보는 요청 컨텍스트에서 가져옴
}

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
  createdAt!: Date;
} 