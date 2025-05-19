import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Request, UseGuards, Put } from '@nestjs/common';
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
import { UpdateRoleDto } from '../dto/update-role.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

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

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @Get('users/by-email/:email')
  async getUserByEmail(@Param('email') email: string, @Request() req: { user: RequestUser }) {
    return this.rpcClientProxyService.send(
      this.authClient,
      { cmd: 'get-user-by-email' }, 
      { email, user: req.user }
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('users/:id')
  async updateUser(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: { user: RequestUser }
  ) {
    return this.rpcClientProxyService.send(
      this.authClient,
      { cmd: 'update-user' }, 
      { id, ...updateUserDto, user: req.user }
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  // 테스트를 위해 아래 주석처리, 첫 계정 생성 후 활성화 필요
  // @Roles(UserRole.ADMIN)
  @Put('users/:id/role')
  async updateUserRole(
    @Param('id') id: string, 
    @Body() updateRoleDto: UpdateRoleDto,
    @Request() req: { user: RequestUser }
  ) {
    return this.rpcClientProxyService.send(
      this.authClient,
      { cmd: 'update-user-role' }, 
      { id, role: updateRoleDto.role, user: req.user }
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
