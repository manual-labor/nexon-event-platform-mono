import { IsEmail, IsNotEmpty, IsMongoId, IsString } from 'class-validator';

export class FriendInviteDto {
  @IsEmail()
  @IsNotEmpty()
  inviterEmail!: string;
}

export class RequestRewardDto {
  @IsString()
  @IsNotEmpty()
  eventId!: string;

  @IsString()
  @IsNotEmpty()
  rewardId!: string;
} 