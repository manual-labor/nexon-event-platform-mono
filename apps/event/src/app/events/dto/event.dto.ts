import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDate, IsArray, IsMongoId, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus, EventConditionType } from '../schemas/event.schema';

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

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(EventStatus)
  @IsNotEmpty()
  status!: EventStatus;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate!: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate!: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventConditionDto)
  @IsOptional()
  conditions?: EventConditionDto[];
}

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventConditionDto)
  @IsOptional()
  conditions?: EventConditionDto[];
}

export class EventResponseDto {
  @IsMongoId()
  id!: string;
  
  @IsString()
  title!: string;
  
  @IsString()
  @IsOptional()
  description?: string;
  
  @IsEnum(EventStatus)
  status!: EventStatus;
  
  @IsDate()
  startDate!: Date;
  
  @IsDate()
  endDate!: Date;
  
  @IsArray()
  conditions!: EventConditionDto[];
  
  @IsDate()
  createdAt!: Date;
  
  @IsDate()
  updatedAt!: Date;
}


