import { IsString, IsOptional, IsNotEmpty, IsBoolean, IsDateString, IsArray, IsEnum, IsObject, ValidateNested, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate!: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate!: Date;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RewardDto)
  @IsOptional()
  rewards?: RewardDto[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
