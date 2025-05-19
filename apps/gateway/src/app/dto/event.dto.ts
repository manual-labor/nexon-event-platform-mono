import { IsString, IsOptional, IsNotEmpty, IsBoolean, IsDateString, IsArray, IsEnum, IsObject, ValidateNested, IsNumber, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { EventConditionType, EventStatus, RewardType } from '../common/constants/enums';
import { UserRole } from '../../interfaces/user.interface'; // UserRole 경로는 실제 프로젝트 구조에 맞게 조정 필요
import { ApiProperty } from '@nestjs/swagger';
import { RewardResponseDto } from './reward.dto';

export class EventConditionDto {
  @ApiProperty({ description: '이벤트 조건 유형', enum: EventConditionType, example: EventConditionType.PARTICIPATION_VERIFICATION })
  @IsEnum(EventConditionType)
  @IsNotEmpty()
  type!: EventConditionType;

  @ApiProperty({ description: '이벤트 조건 값', type: Number, example: 10 })
  @IsNumber()
  @IsNotEmpty()
  value!: number;

  @ApiProperty({ description: '이벤트 조건 설명', required: false, example: '친구 초대 7명 이상' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class RewardDto {
  @ApiProperty({ description: '보상 이름', example: '넥슨 캐시 1000원권' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: '보상 설명', example: '넥슨 캐시 1000원권 1개' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ description: '보상 유형', enum: RewardType, required: false, example: RewardType.CASH })
  @IsEnum(RewardType)
  @IsNotEmpty()
  type!: RewardType;

  @ApiProperty({ description: '보상 수량', type: Number, example: 1 })
  @IsNumber()
  @IsNotEmpty()
  quantity!: number;

  @ApiProperty({ description: '보상 이미지 URL', required: false, example: 'https://example.com/reward.png' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: '보상 가치 (현금 등)', type: Number, required: false, example: 1000 })
  @IsNumber()
  @IsOptional()
  value?: number;

  @ApiProperty({ description: '추가 메타데이터', type: Object, required: false, example: { grade: 'rare' } })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class EventDto {
  @ApiProperty({ description: '이벤트 제목', example: '신규 유저 환영 이벤트' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: '이벤트 설명', example: '신규 유저에게 특별한 보상을 드립니다.' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ description: '이벤트 시작일', type: String, format: 'date-time', example: '2024-01-01T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @ApiProperty({ description: '이벤트 종료일', type: String, format: 'date-time', example: '2024-01-31T23:59:59Z' })
  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  @ApiProperty({ description: '이벤트 상태', required: false, example: '진행중' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: '이벤트 이미지 URL', required: false, example: 'https://example.com/event.png' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: '이벤트 태그 목록', type: Array, required: false, example: ['신규유저', '환영이벤트'] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ description: '이벤트 조건', type: EventConditionDto, required: false })
  @ValidateNested()
  @Type(() => EventConditionDto)
  @IsOptional()
  condition?: EventConditionDto;

  @ApiProperty({ description: '추가 메타데이터', type: Object, required: false, example: { difficulty: 'easy' } })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export enum RewardHistoryStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export class UpdateRewardHistoryStatusDto {
  @ApiProperty({ description: '보상 지급 상태', enum: RewardHistoryStatus, example: RewardHistoryStatus.SUCCESS })
  @IsEnum(RewardHistoryStatus)
  @IsNotEmpty()
  status!: RewardHistoryStatus;
}


export class EventResponseDto {
  @ApiProperty({ description: '이벤트 ID', example: '60b8d295f1d2e2001c8b456e' })
  @IsMongoId()
  id!: string;
  
  @ApiProperty({ description: '이벤트 제목', example: '새해 맞이 출석 이벤트' })
  @IsString()
  title!: string;
  
  @ApiProperty({ description: '이벤트 상세 설명', required: false, example: '매일 출석하고 보상 받으세요!' })
  @IsString()
  @IsOptional()
  description?: string;
  
  @ApiProperty({ description: '이벤트 상태', enum: EventStatus, example: EventStatus.ONGOING })
  @IsEnum(EventStatus)
  status!: EventStatus;
  
  @ApiProperty({ description: '이벤트 시작일', type: Date, example: '2025-01-01T00:00:00.000Z' })
  @IsDateString()
  startDate!: Date;
  
  @ApiProperty({ description: '이벤트 종료일', type: Date, example: '2025-01-31T23:59:59.000Z' })
  @IsDateString()
  endDate!: Date;
  
  @ApiProperty({ description: '이벤트 참여 조건', type: EventConditionDto, required: false })
  @ValidateNested()
  @Type(() => EventConditionDto)
  @IsOptional()
  condition?: EventConditionDto;

  @ApiProperty({ description: '이벤트 보상 목록', type: [RewardResponseDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RewardResponseDto)
  @IsOptional()
  rewards?: RewardResponseDto[];
  
  @ApiProperty({ description: '생성 일시', type: Date, required: false, example: '2024-12-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  createdAt?: Date;
  
  @ApiProperty({ description: '수정 일시', type: Date, required: false, example: '2024-12-02T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  updatedAt?: Date;
}


