import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginDto, UserResponseDto, AuthResponseDto, TokenValidationDto, TokenValidationResponseDto } from '../users/dto/user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'Login')
  async login(loginData: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginData);
  }

  @GrpcMethod('AuthService', 'Register')
  async register(registerData: CreateUserDto): Promise<AuthResponseDto> {
    return this.authService.register(registerData);
  }

  @GrpcMethod('AuthService', 'ValidateToken')
  async validateToken(data: TokenValidationDto): Promise<TokenValidationResponseDto> {
    return this.authService.validateToken(data.token);
  }

  @GrpcMethod('AuthService', 'GetUserById')
  async getUserProfile(data: { id: string }): Promise<UserResponseDto> {
    return this.authService.getUserProfile(data.id);
  }

  @GrpcMethod('AuthService', 'GetUsers')
  async getUsers(data: { page: number, limit: number, search: string }): Promise<{ users: UserResponseDto[], total: number, page: number, limit: number }> {
    const users = await this.authService.getUsers();
    return {
      users,
      total: users.length,
      page: data.page || 1,
      limit: data.limit || users.length
    };
  }

  @GrpcMethod('AuthService', 'UpdateUser')
  async updateUser(data: { id: string, name: string, email: string, role: string }): Promise<{ user: UserResponseDto }> {
    // 업데이트 기능 구현 필요 - 현재 시스템에서 지원하지 않는 경우 스켈레톤 코드만 추가
    const user = await this.authService.getUserProfile(data.id);
    return { user };
  }
} 