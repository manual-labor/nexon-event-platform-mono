import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../interfaces/user.interface';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nickname!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsString()
  @IsOptional()
  provider?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}