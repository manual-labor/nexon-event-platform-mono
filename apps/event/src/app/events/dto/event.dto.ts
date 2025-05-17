import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDate, IsArray, IsMongoId, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus, EventConditionType } from '../schemas/event.schema';
import { TransformDate } from '../../common/decorators/type.decorator';

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
  @IsNotEmpty()
  @TransformDate()
  startDate!: Date;

  @IsDate()
  @IsNotEmpty()
  @TransformDate()
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
  @TransformDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @TransformDate()
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


