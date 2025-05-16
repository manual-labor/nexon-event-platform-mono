import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginDto, UserResponseDto, AuthResponseDto, TokenValidationDto, TokenValidationResponseDto } from '../users/dto/user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() loginData: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginData);
  }

  @MessagePattern({ cmd: 'register' })
  async register(@Payload() registerData: CreateUserDto): Promise<AuthResponseDto> {
    return this.authService.register(registerData);
  }

  @MessagePattern({ cmd: 'validate-token' })
  async validateToken(@Payload() data: TokenValidationDto): Promise<TokenValidationResponseDto> {
    return this.authService.validateToken(data.token);
  }

  @MessagePattern({ cmd: 'get-user-profile' })
  async getUserProfile(@Payload() data: { userId: string }): Promise<UserResponseDto> {
    return this.authService.getUserProfile(data.userId);
  }

  @MessagePattern({ cmd: 'get-users' })
  async getUsers(): Promise<UserResponseDto[]> {
    return this.authService.getUsers();
  }
} 