import { IsString, IsOptional, IsNotEmpty, IsBoolean, IsDateString, IsArray, IsEnum, IsObject, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { EventConditionType } from '../common/constants/enums';

export class EventConditionDto {
  @IsEnum(EventConditionType)
  @IsNotEmpty()
  type!: EventConditionType;

  @IsNumber()
  @IsNotEmpty()
  value!: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class RewardDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsNumber()
  @IsNotEmpty()
  quantity!: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class EventDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @ValidateNested()
  @Type(() => EventConditionDto)
  @IsOptional()
  condition?: EventConditionDto;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
