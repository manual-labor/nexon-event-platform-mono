import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsDate, IsMongoId, IsBoolean, IS_MONGO_ID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RewardHistoryStatus, RewardType } from '../common/constants/enums';

export class CreateRewardDto {
  @ApiProperty({ description: '이벤트 ID', required: false, example: '60b8d295f1d2e2001c8b4567' })
  @IsMongoId()
  @IsOptional()
  eventId?: string;

  @ApiProperty({ description: '보상 이름', example: '골드 주머니' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: '보상 유형', enum: RewardType, example: RewardType.ITEM })
  @IsEnum(RewardType)
  @IsNotEmpty()
  type!: RewardType;

  @ApiProperty({ description: '보상 수량', type: Number, example: 100 })
  @IsNumber()
  @IsNotEmpty()
  quantity!: number;

  @ApiProperty({ description: '보상 설명', required: false, example: '100 골드를 즉시 지급합니다.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '단위 가치 (예: 아이템 가격)', type: Number, required: false, example: 10 })
  @IsNumber()
  @IsOptional()
  unitValue?: number;
}

export class UpdateRewardDto {
  @ApiProperty({ description: '보상 이름', required: false, example: '프리미엄 골드 주머니' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: '보상 유형', enum: RewardType, required: false, example: RewardType.CASH })
  @IsEnum(RewardType)
  @IsOptional()
  type?: RewardType;

  @ApiProperty({ description: '보상 수량', type: Number, required: false, example: 200 })
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiProperty({ description: '보상 설명', required: false, example: '200 프리미엄 골드를 지급합니다.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '단위 가치', type: Number, required: false, example: 20 })
  @IsNumber()
  @IsOptional()
  unitValue?: number;
}

export class RewardResponseDto {
  @ApiProperty({ description: '보상 ID', example: '60b8d295f1d2e2001c8b456a' })
  @IsMongoId()
  id!: string;

  @ApiProperty({ description: '이벤트 ID', example: '60b8d295f1d2e2001c8b4567' })
  @IsMongoId()
  eventId!: string;

  @ApiProperty({ description: '보상 이름', example: '골드 주머니' })
  @IsString()
  name!: string;

  @ApiProperty({ description: '보상 유형', enum: RewardType, example: RewardType.ITEM })
  @IsEnum(RewardType)
  type!: RewardType;

  @ApiProperty({ description: '보상 수량', type: Number, example: 100 })
  @IsNumber()
  quantity!: number;

  @ApiProperty({ description: '보상 설명', required: false, example: '100 골드를 즉시 지급합니다.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '단위 가치', type: Number, required: false, example: 10 })
  @IsNumber()
  @IsOptional()
  unitValue?: number;

  @ApiProperty({ description: '생성 일시', type: Date, required: false, example: '2024-01-01T00:00:00.000Z' })
  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @ApiProperty({ description: '수정 일시', type: Date, required: false, example: '2024-01-02T00:00:00.000Z' })
  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}

export class RequestRewardDto {
  @ApiProperty({ description: '이벤트 ID', example: '60b8d295f1d2e2001c8b4567' })
  @IsMongoId()
  @IsNotEmpty()
  eventId!: string;

  @ApiProperty({ description: '보상 ID', example: '60b8d295f1d2e2001c8b456a' })
  @IsMongoId()
  @IsNotEmpty()
  rewardId!: string;
}

export class RewardHistoryResponseDto {
  @ApiProperty({ description: '보상 지급 내역 ID', example: '60b8d295f1d2e2001c8b456b' })
  @IsMongoId()
  id!: string;

  @ApiProperty({ description: '사용자 ID', example: '60b8d295f1d2e2001c8b4568' })
  @IsMongoId()
  userId!: string;

  @ApiProperty({ description: '이벤트 ID', example: '60b8d295f1d2e2001c8b4567' })
  @IsMongoId()
  eventId!: string;

  @ApiProperty({ description: '보상 ID', example: '60b8d295f1d2e2001c8b456a' })
  @IsMongoId()
  rewardId!: string;

  @ApiProperty({ description: '보상 지급 상태', enum: RewardHistoryStatus, example: RewardHistoryStatus.SUCCESS })
  @IsEnum(RewardHistoryStatus)
  status!: RewardHistoryStatus;

  @ApiProperty({ description: '보상 지급 일시', type: Date, required: false, nullable: true, example: '2024-03-15T10:30:00.000Z' })
  @IsDate()
  @IsOptional()
  rewardAt?: Date | null;

  @ApiProperty({ description: '내역 생성 일시', type: Date, example: '2024-03-15T10:20:00.000Z' })
  @IsDate()
  createdAt!: Date;
}

export class GetRewardHistoryDto {
  @ApiProperty({ description: '사용자 ID (필터링용)', required: false, example: '60b8d295f1d2e2001c8b4568' })
  @IsMongoId()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: '이벤트 ID (필터링용)', required: false, example: '60b8d295f1d2e2001c8b4567' })
  @IsMongoId()
  @IsOptional()
  eventId?: string;
}

export class EventRewardHistoryResponseDto {
  @ApiProperty({ description: '이벤트 ID', example: '60b8d295f1d2e2001c8b4567' })
  @IsMongoId()
  eventId!: string;

  @ApiProperty({ description: '이벤트 제목', example: '출석 체크 이벤트' })
  @IsString()
  eventTitle!: string;

  @ApiProperty({ description: '이벤트 보상 지급 내역 목록', type: [RewardHistoryResponseDto] })
  @ValidateNested({ each: true })
  @Type(() => RewardHistoryResponseDto)
  rewards!: RewardHistoryResponseDto[];
}

export class UpdateRewardHistoryStatusDto {
  @ApiProperty({ description: '변경할 보상 지급 상태', enum: RewardHistoryStatus, example: RewardHistoryStatus.PENDING })
  @IsEnum(RewardHistoryStatus)
  @IsNotEmpty()
  status!: RewardHistoryStatus;
}

