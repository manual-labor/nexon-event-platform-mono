import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../../interfaces/user.interface';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: '변경할 사용자 닉네임', required: false, example: '업데이트된유저' })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({ description: '변경할 사용자 이메일', required: false, example: 'updateduser@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: '변경할 사용자 비밀번호', minLength: 6, required: false, example: 'updatedpassword123' })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiProperty({ description: '변경할 사용자 역할', enum: UserRole, required: false, example: UserRole.ADMIN })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}