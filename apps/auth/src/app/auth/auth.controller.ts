import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginDto, UserResponseDto, AuthResponseDto, TokenValidationDto, TokenValidationResponseDto } from '../users/dto/user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserRole } from '../interfaces/user.interface';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'login' })
  async login(loginData: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginData);
  }

  @MessagePattern({ cmd: 'register' })
  async register(registerData: CreateUserDto): Promise<AuthResponseDto> {
    return this.authService.register(registerData);
  }

  @MessagePattern({ cmd: 'validate-token' })
  async validateToken(data: TokenValidationDto): Promise<TokenValidationResponseDto> {
    return this.authService.validateToken(data.token);
  }

  @MessagePattern({ cmd: 'get-my-profile' })
  async getMyProfile(data: { userId: string }): Promise<UserResponseDto> {
    return this.authService.getUserProfile(data.userId);
  }

  @MessagePattern({ cmd: 'get-user-profile' })
  async getUserProfile(data: { userId: string }): Promise<UserResponseDto> {
    return this.authService.getUserProfile(data.userId);
  }

  @MessagePattern({ cmd: 'get-users' })
  async getUsers(data: { page: number, limit: number, search: string }): Promise<{ users: UserResponseDto[], total: number, page: number, limit: number }> {
    const users = await this.authService.getUsers();
    return {
      users,
      total: users.length,
      page: data.page || 1,
      limit: data.limit || users.length
    };
  }

  @MessagePattern({ cmd: 'update-user' })
  async updateUser(data: { id: string, name: string, email: string, role: string }): Promise<{ user: UserResponseDto }> {
    const user = await this.authService.getUserProfile(data.id);
    return { user };
  }

  @MessagePattern({ cmd: 'update-user-role' })
  async updateUserRole(data: { id: string, role: UserRole, user?: any }): Promise<{ user: UserResponseDto }> {
    const updatedUser = await this.authService.updateUserRole(data.id, data.role, data.user?.id);
    return { user: updatedUser };
  }

  @MessagePattern({ cmd: 'get-user-by-email' })
  async getUserByEmail(data: { email: string }): Promise<UserResponseDto | null> {
    return this.authService.getUserByEmail(data.email);
  }
} 