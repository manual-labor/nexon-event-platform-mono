import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto, AuthResponseDto, TokenValidationResponseDto, UserResponseDto } from '../users/dto/user.dto';
import { User } from '../users/schemas/users.schema';
import { UserProvider } from '../interfaces/user.interface';
import {
  InvalidCredentialsException,
  PasswordRequiredException,
  EmailAlreadyExistsException,
  UserNotFoundException
} from '../common/exceptions/app-exception';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async login(loginData: LoginDto): Promise<AuthResponseDto> {
    const user: User|null = await this.usersService.findByEmail(loginData.email);

    if (!user) {
      throw new InvalidCredentialsException('이메일 또는 비밀번호가 올바르지 않습니다.', { email: loginData.email });
    }

    if (user.provider === UserProvider.LOCAL) {
      if (!user.password) {
        throw new PasswordRequiredException('비밀번호가 설정되지 않은 계정입니다.', { userId: user.id, email: user.email });
      }

      const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
      if (!isPasswordValid) {
        throw new InvalidCredentialsException('이메일 또는 비밀번호가 올바르지 않습니다.', { email: loginData.email });
      }
    }

    await this.usersService.updateLastLogin(user.id);

    return {
      accessToken: this.jwtService.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      }),
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
      },
    };
  }

  async register(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    const existingUser: User| null = await this.usersService.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new EmailAlreadyExistsException('이미 존재하는 이메일입니다.', { email: createUserDto.email });
    }

    const user = await this.usersService.create(createUserDto);

    return {
      accessToken: this.jwtService.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      }),
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
      },
    };
  }

  async validateToken(token: string): Promise<TokenValidationResponseDto> {
    try {
      const payload = this.jwtService.verify(token);
      return { 
        isValid: true, 
        user: {
          id: payload.id,
          email: payload.email,
          role: payload.role,
        } 
      };
    } catch (error) {
      return { isValid: false, message: '유효하지 않은 토큰입니다.' };
    }
  }

  async getUserProfile(userId: string): Promise<UserResponseDto> {
    const user : User|null = await this.usersService.findById(userId);
    if (!user) {
      throw new UserNotFoundException(`사용자를 찾을 수 없습니다. ID: ${userId}`, { userId });
    }
    
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      provider: user.provider,
      lastLogin: user.lastLogin,
    };
  }

  async getUsers(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll();
    return users.map(user => ({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      provider: user.provider,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
  }

  async getUserByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }
    
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      provider: user.provider,
      lastLogin: user.lastLogin,
    };
  }
} 