import { IsEmail, IsNotEmpty, IsMongoId } from 'class-validator';

export class FriendInviteDto {
  @IsEmail()
  @IsNotEmpty()
  inviteeEmail!: string;
}

export class RequestRewardDto {
  @IsMongoId()
  @IsNotEmpty()
  eventId!: string;

  @IsMongoId()
  @IsNotEmpty()
  rewardId!: string;
} 