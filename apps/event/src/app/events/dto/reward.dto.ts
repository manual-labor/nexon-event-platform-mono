import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsDate, IsMongoId, IsBoolean, IS_MONGO_ID } from 'class-validator';
import { Type } from 'class-transformer';
import { RewardType } from '../schemas/reward.schema';

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
  createdAt!: Date;

  @IsDate()
  updatedAt!: Date;
}

export class RequestRewardDto {
  @IsMongoId()
  @IsNotEmpty()
  eventId!: string;

  @IsMongoId()
  @IsNotEmpty()
  rewardId!: string;
}

