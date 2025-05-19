import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDate, IsArray, IsMongoId, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus, EventConditionType } from '../schemas/event.schema';
import { RewardResponseDto } from './reward.dto';
import { ApiProperty } from '@nestjs/swagger';

export class EventConditionDto {
  @ApiProperty({ description: '이벤트 조건 유형', enum: EventConditionType, example: EventConditionType.PARTICIPATION_VERIFICATION })
  @IsEnum(EventConditionType)
  @IsNotEmpty()
  type!: EventConditionType;

  @ApiProperty({ description: '이벤트 조건 값', type: Number, example: 10 })
  @IsNumber()
  @IsNotEmpty()
  value!: number;

  @ApiProperty({ description: '이벤트 조건 설명', required: false, example: '사용자 레벨 10 이상' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '생성 일시', type: Date, required: false, example: '2024-01-01T00:00:00.000Z' })
  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @ApiProperty({ description: '수정 일시', type: Date, required: false, example: '2024-01-02T00:00:00.000Z' })
  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}

export class CreateEventDto {
  @ApiProperty({ description: '이벤트 제목', example: '새해 맞이 출석 이벤트' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: '이벤트 상세 설명', required: false, example: '매일 출석하고 보상 받으세요!' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '이벤트 상태', enum: EventStatus, example: EventStatus.UPCOMING })
  @IsEnum(EventStatus)
  @IsNotEmpty()
  status!: EventStatus;

  @ApiProperty({ description: '이벤트 시작일', type: Date, example: '2025-01-01T00:00:00.000Z' })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate!: Date;

  @ApiProperty({ description: '이벤트 종료일', type: Date, example: '2025-01-31T23:59:59.000Z' })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate!: Date;

  @ApiProperty({ description: '이벤트 참여 조건', type: EventConditionDto, required: false })
  @ValidateNested()
  @Type(() => EventConditionDto)
  @IsOptional()
  condition?: EventConditionDto;
}

export class UpdateEventDto {
  @ApiProperty({ description: '이벤트 제목', required: false, example: '[수정] 새해 맞이 출석 이벤트' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: '이벤트 상세 설명', required: false, example: '매일 출석하고 푸짐한 보상 받으세요!' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '이벤트 상태', enum: EventStatus, required: false, example: EventStatus.ONGOING })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @ApiProperty({ description: '이벤트 시작일', type: Date, required: false, example: '2025-01-01T00:00:00.000Z' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ description: '이벤트 종료일', type: Date, required: false, example: '2025-01-31T23:59:59.000Z' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ description: '이벤트 참여 조건', type: EventConditionDto, required: false })
  @ValidateNested()
  @Type(() => EventConditionDto)
  @IsOptional()
  condition?: EventConditionDto;
}

export class EventResponseDto {
  @ApiProperty({ description: '이벤트 ID', example: '60b8d295f1d2e2001c8b456e' })
  @IsMongoId()
  eventId!: string;
  
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
  @IsDate()
  startDate!: Date;
  
  @ApiProperty({ description: '이벤트 종료일', type: Date, example: '2025-01-31T23:59:59.000Z' })
  @IsDate()
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
  @IsDate()
  @IsOptional()
  createdAt?: Date;
  
  @ApiProperty({ description: '수정 일시', type: Date, required: false, example: '2024-12-02T00:00:00.000Z' })
  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}


