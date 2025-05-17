import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Request, UseGuards, OnModuleInit } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../../interfaces/user.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Public } from '../decorators/public.decorator';
import { RpcClientProxyService } from '../services/rpc-client-proxy.service';
import { LoginDto, RegisterDto, TokenDto } from '../dto/auth.dto';
import { RequestUser } from '../interfaces/request-user.interface';
import { Observable } from 'rxjs';

// gRPC 인터페이스 정의
interface AuthService {
  login(data: LoginDto): Observable<any>;
  register(data: RegisterDto): Observable<any>;
  getUserById(data: { id: string }): Observable<any>;
  getUsers(data: { page: number, limit: number, search: string }): Observable<any>;
  validateToken(data: { token: string }): Observable<any>;
  updateUser(data: any): Observable<any>;
}

@Controller('auth')
export class AuthController implements OnModuleInit {
  private authService!: AuthService;

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientGrpc,
    private readonly rpcClientProxyService: RpcClientProxyService,
  ) {}

  onModuleInit() {
    this.authService = this.rpcClientProxyService.getService<AuthService>(this.authClient, 'AuthService');
  }

  @Public()
  @Post('login')
  async login(@Body() loginData: LoginDto) {
    return this.rpcClientProxyService.call(
      this.authService,
      'login',
      loginData
    );
  }

  @Public()
  @Post('register')
  async register(@Body() registerData: RegisterDto) {
    return this.rpcClientProxyService.call(
      this.authService,
      'register',
      registerData
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: { user: RequestUser }) {
    return this.rpcClientProxyService.call(
      this.authService,
      'getUserById',
      { id: req.user.id }
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/:id')
  async getUserProfile(@Param('id') userId: string, @Request() req: { user: RequestUser }) {
    return this.rpcClientProxyService.call(
      this.authService,
      'getUserById',
      { id: userId }
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('users')
  async getUsers(@Request() req: { user: RequestUser }) {
    return this.rpcClientProxyService.call(
      this.authService,
      'getUsers',
      { page: 1, limit: 100, search: '' }
    );
  }

  @Public()
  @Post('validate')
  async validateToken(@Body() data: TokenDto) {
    return this.rpcClientProxyService.call(
      this.authService,
      'validateToken',
      { token: data.token }
    );
  }
}
