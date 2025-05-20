import { IsString, IsEmail, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../interfaces/user.interface';
import { UserResponseDto } from './user.dto';

export class LoginDto {
  @ApiProperty({ description: '사용자 이메일', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: '사용자 비밀번호', example: 'password123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}

export class RegisterDto {
  @ApiProperty({ description: '사용자 이메일', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: '사용자 비밀번호', example: 'password123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @ApiProperty({ description: '사용자 닉네임', example: '홍길동' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(30)
  nickname!: string;

  @ApiProperty({ description: 'OAuth 제공자 (google, kakao 등)', example: 'LOCAL', required: false })
  @IsString()
  @IsOptional()
  provider?: string;
}

export class TokenDto {
  @ApiProperty({ description: 'JWT 토큰', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  @IsNotEmpty()
  token!: string;
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
