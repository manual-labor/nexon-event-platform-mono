import { IsString, IsEmail, IsNotEmpty, IsOptional, IsEnum, IsDate, IsMongoId, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole, UserProvider } from '../../interfaces/user.interface';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '사용자 이메일', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: '사용자 비밀번호', example: 'password123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class UserResponseDto {
  @ApiProperty({ description: '사용자 ID', example: '60b8d295f1d2e2001c8b4567' })
  @IsMongoId()
  userId!: string;

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

export class AuthResponseDto {
  @ApiProperty({ description: '액세스 토큰', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ description: '사용자 정보', type: UserResponseDto })
  user!: {
    id: string;
    email: string;
    nickname: string;
    role: UserRole;
  };
}

export class TokenValidationDto {
  @ApiProperty({ description: '검증할 토큰', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class TokenValidationResponseDto {
  @ApiProperty({ description: '토큰 유효성 여부', type: Boolean, example: true })
  isValid!: boolean;

  @ApiProperty({ description: '사용자 정보 (토큰이 유효한 경우)', type: UserResponseDto, required: false })
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };

  @ApiProperty({ description: '메시지 (토큰이 유효하지 않은 경우)', example: 'Invalid token', required: false })
  message?: string;
} 