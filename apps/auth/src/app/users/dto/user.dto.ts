import { IsString, IsEmail, IsNotEmpty, IsOptional, IsEnum, IsDate, IsMongoId, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole, UserProvider } from '../../interfaces/user.interface';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class UserResponseDto {
  @IsMongoId()
  id!: string;

  @IsEmail()
  email!: string;

  @IsString()
  nickname!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsEnum(UserProvider)
  provider!: UserProvider;

  @IsDate()
  @IsOptional()
  lastLogin?: Date;

  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}

export class AuthResponseDto {
  accessToken!: string;
  user!: {
    id: string;
    email: string;
    nickname: string;
    role: UserRole;
  };
}

export class TokenValidationDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class TokenValidationResponseDto {
  isValid!: boolean;
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
  message?: string;
} 