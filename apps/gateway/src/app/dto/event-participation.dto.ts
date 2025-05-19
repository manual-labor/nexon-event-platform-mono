import { IsEmail, IsNotEmpty, IsMongoId, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FriendInviteDto {
  @ApiProperty({ description: '초대를 받았던 유저 Email', example: 'inviter@example.com' })
  @IsEmail()
  @IsNotEmpty()
  inviterEmail!: string;
}

export class RequestRewardDto {
  @ApiProperty({ description: '이벤트 ID', example: 'event_id_string_123' })
  @IsString()
  @IsNotEmpty()
  eventId!: string;

  @ApiProperty({ description: '보상 ID', example: 'reward_id_string_456' })
  @IsString()
  @IsNotEmpty()
  rewardId!: string;
} 