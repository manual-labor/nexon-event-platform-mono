import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Request, UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../../interfaces/user.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Public } from '../decorators/public.decorator';
import { RpcClientProxyService } from '../services/rpc-client-proxy.service';
import { LoginDto, RegisterDto, TokenDto } from '../dto/auth.dto';
import { RequestUser } from '../interfaces/request-user.interface';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private readonly rpcClientProxyService: RpcClientProxyService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() loginData: LoginDto) {
    return this.rpcClientProxyService.send(
      this.authClient, 
      { cmd: 'login' }, 
      loginData
    );
  }

  @Public()
  @Post('register')
  async register(@Body() registerData: RegisterDto) {
    return this.rpcClientProxyService.send(
      this.authClient,
      { cmd: 'register' }, 
      registerData
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: { user: RequestUser }) {
    return this.rpcClientProxyService.send(
      this.authClient,
      { cmd: 'get-user-profile' }, 
      { userId: req.user.id, user: req.user }
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/:id')
  async getUserProfile(@Param('id') userId: string, @Request() req: { user: RequestUser }) {
    return this.rpcClientProxyService.send(
      this.authClient,
      { cmd: 'get-user-profile' }, 
      { userId, user: req.user }
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('users')
  async getUsers(@Request() req: { user: RequestUser }) {
    return this.rpcClientProxyService.send(
      this.authClient,
      { cmd: 'get-users' }, 
      { user: req.user }
    );
  }

  @Public()
  @Post('validate')
  async validateToken(@Body() data: TokenDto) {
    return this.rpcClientProxyService.send(
      this.authClient,
      { cmd: 'validate-token' }, 
      { token: data.token }
    );
  }
}
