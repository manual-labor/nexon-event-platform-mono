import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../../interfaces/user.interface';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: '사용자 닉네임', example: '새로운유저' })
  @IsString()
  @IsNotEmpty()
  nickname!: string;

  @ApiProperty({ description: '사용자 이메일', example: 'newuser@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: '사용자 비밀번호 (OAuth 사용 시 불필요)', minLength: 6, required: false, example: 'newpassword123' })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiProperty({ description: 'OAuth 제공자 (e.g., google, kakao)', required: false, example: 'google' })
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiProperty({ description: '사용자 역할', enum: UserRole, required: false, example: UserRole.USER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}