import { IsDate, IsMongoId, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AttendanceResponseDto {
  @ApiProperty({ description: '출석 기록 ID', example: '60b8d295f1d2e2001c8b4567' })
  @IsMongoId()
  id!: string;

  @ApiProperty({ description: '사용자 ID', example: '60b8d295f1d2e2001c8b4568' })
  @IsMongoId()
  userId!: string;

  @ApiProperty({ description: '출석 날짜', type: Date, example: '2024-03-15T00:00:00.000Z' })
  @IsDate()
  attendanceDate!: Date;

  @ApiProperty({ description: '연속 출석 일수', type: Number, example: 5 })
  @IsNumber()
  consecutiveDays!: number;

  @ApiProperty({ description: '생성 일시', type: Date, required: false, example: '2024-03-15T10:00:00.000Z' })
  @IsDate()
  createdAt?: Date;
} 