import { IsEmail, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: '변경할 사용자 닉네임', minLength: 2, maxLength: 30, required: false, example: '게이트웨이유저' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(30)
  nickname?: string;

  @ApiProperty({ description: '변경할 사용자 이메일', required: false, example: 'gatewayuser@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: '변경할 사용자 비밀번호', minLength: 6, required: false, example: 'gatewaypassword123' })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;
} 