import { IsString, IsNotEmpty, IsOptional, IsDate, IsMongoId, IsBoolean, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class FriendInviteRequestDto {
  @IsEmail()
  @IsNotEmpty()
  inviteeEmail!: string;
}

export class FriendInviteResponseDto {
  @IsMongoId()
  id!: string;

  @IsMongoId()
  inviterId!: string;

  @IsEmail()
  inviteeEmail!: string;

  @IsMongoId()
  @IsOptional()
  inviteeId?: string;

  @IsBoolean()
  isRegistered!: boolean;

  @IsDate()
  createdAt!: Date;
} 