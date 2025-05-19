import { IsString, IsNotEmpty, IsOptional, IsDate, IsMongoId, IsBoolean, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FriendInviteRequestDto {
  @ApiProperty({ description: '초대하는 사용자의 이메일', example: 'inviter@example.com' })
  @IsEmail()
  @IsNotEmpty()
  inviterEmail!: string;
}

export class FriendInviteResponseDto {
  @ApiProperty({ description: '초대한 사용자의 ID', example: '60b8d295f1d2e2001c8b45f0' })
  @IsMongoId()
  inviterId!: string;

  @ApiProperty({ description: '초대한 사용자의 이메일', example: 'inviter@example.com' })
  @IsEmail()
  inviterEmail!: string;

  @ApiProperty({ description: '초대받은 사용자의 ID (수락 시)', required: false, example: '60b8d295f1d2e2001c8b45f1' })
  @IsMongoId()
  @IsOptional()
  inviteeId?: string;

  @ApiProperty({ description: '초대 생성 일시', type: Date, required: false, example: '2024-03-10T10:00:00.000Z' })
  @IsDate()
  @IsOptional()
  createdAt?: Date;
} 