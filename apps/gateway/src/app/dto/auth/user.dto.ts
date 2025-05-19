import { IsString, IsEmail, IsNotEmpty, IsOptional, IsEnum, IsDate, IsMongoId, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole, UserProvider } from '../../../interfaces/user.interface';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: '사용자 ID', example: '60b8d295f1d2e2001c8b4567' })
  @IsMongoId()
  id!: string;

  @ApiProperty({ description: '사용자 이메일', example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: '사용자 닉네임', example: '홍길동' })
  @IsString()
  nickname!: string;

  @ApiProperty({ description: '사용자 역할', enum: UserRole, example: UserRole.USER })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiProperty({ description: 'OAuth 제공자', enum: UserProvider, example: UserProvider.LOCAL })
  @IsEnum(UserProvider)
  provider!: UserProvider;

  @ApiProperty({ description: '마지막 로그인 일시', type: Date, required: false, example: '2023-01-01T12:00:00.000Z' })
  @IsDate()
  @IsOptional()
  lastLogin?: Date;

  @ApiProperty({ description: '생성 일시', type: Date, required: false, example: '2023-01-01T00:00:00.000Z' })
  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @ApiProperty({ description: '수정 일시', type: Date, required: false, example: '2023-01-02T00:00:00.000Z' })
  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}

