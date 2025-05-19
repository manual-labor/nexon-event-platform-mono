import { IsString, IsNotEmpty, IsOptional, IsDate, IsMongoId, IsBoolean, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class FriendInviteRequestDto {
  @IsEmail()
  @IsNotEmpty()
  inviterEmail!: string;
}

export class FriendInviteResponseDto {
  @IsMongoId()
  inviterId!: string;

  @IsEmail()
  inviterEmail!: string;

  @IsMongoId()
  @IsOptional()
  inviteeId?: string;

  @IsDate()
  createdAt?: Date;
} 