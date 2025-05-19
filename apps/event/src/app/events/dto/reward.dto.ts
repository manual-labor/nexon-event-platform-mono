import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsDate, IsMongoId, IsBoolean, IS_MONGO_ID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RewardType, RewardHistoryStatus } from '../schemas/reward.schema';

export class CreateRewardDto {
  @IsMongoId()
  @IsOptional()
  eventId?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(RewardType)
  @IsNotEmpty()
  type!: RewardType;

  @IsNumber()
  @IsNotEmpty()
  quantity!: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateRewardDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(RewardType)
  @IsOptional()
  type?: RewardType;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class RewardResponseDto {
  @IsMongoId()
  id!: string;

  @IsMongoId()
  eventId!: string;

  @IsString()
  name!: string;

  @IsEnum(RewardType)
  type!: RewardType;

  @IsNumber()
  quantity!: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}

export class RequestRewardDto {
  @IsMongoId()
  @IsNotEmpty()
  eventId!: string;

  @IsMongoId()
  @IsNotEmpty()
  rewardId!: string;
}

export class RewardHistoryResponseDto {
  @IsMongoId()
  id!: string;

  @IsMongoId()
  userId!: string;

  @IsMongoId()
  eventId!: string;

  @IsMongoId()
  rewardId!: string;

  @IsEnum(RewardHistoryStatus)
  status!: RewardHistoryStatus;

  @IsDate()
  @IsOptional()
  rewardAt?: Date | null;

  @IsDate()
  createdAt!: Date;
}

export class GetRewardHistoryDto {
  @IsMongoId()
  @IsOptional()
  userId?: string;

  @IsMongoId()
  @IsOptional()
  eventId?: string;
}

export class EventRewardHistoryResponseDto {
  @IsMongoId()
  eventId!: string;

  @IsString()
  eventTitle!: string;

  @ValidateNested({ each: true })
  @Type(() => RewardHistoryResponseDto)
  rewards!: RewardHistoryResponseDto[];
}

export class UpdateRewardHistoryStatusDto {
  @IsEnum(RewardHistoryStatus)
  @IsNotEmpty()
  status!: RewardHistoryStatus;
}

