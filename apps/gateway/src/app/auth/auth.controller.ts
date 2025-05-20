import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Request, UseGuards, Put } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Roles } from '../decorators/roles.decorator';
import { RequestUser, UserRole } from '../../interfaces/user.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Public } from '../decorators/public.decorator';
import { RpcClientProxyService } from '../services/rpc-client-proxy.service';
import { LoginDto, RegisterDto, TokenDto } from '../dto/auth/auth.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserResponseDto } from '../dto/auth/user.dto';
import { AuthResponseDto } from '../dto/auth/auth.dto';
import { TokenValidationResponseDto } from '../dto/auth/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private readonly rpcClientProxyService: RpcClientProxyService,
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: '사용자 로그인', description: '이메일과 비밀번호를 사용하여 로그인하고 JWT 토큰을 발급받습니다.' })
  @ApiResponse({ status: 201, description: '로그인 성공, JWT 토큰 발급', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청 형식' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(@Body() loginData: LoginDto) {
    return this.rpcClientProxyService.send(
      this.authClient, 
      { cmd: 'login' }, 
      loginData
    );
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: '사용자 회원가입', description: '새로운 사용자를 등록하고 JWT 토큰을 발급받습니다.' })
  @ApiResponse({ status: 201, description: '회원가입 성공, JWT 토큰 발급', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청 형식 또는 이미 존재하는 이메일' })
  async register(@Body() registerData: RegisterDto) {
    return this.rpcClientProxyService.send(
      this.authClient,
      { cmd: 'register' }, 
      registerData
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: '현재 로그인된 사용자 프로필 조회' })
  @ApiResponse({ status: 200, description: '사용자 프로필 조회 성공', type: UserResponseDto })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async getProfile(@Request() req: { user: RequestUser }) {
    return this.rpcClientProxyService.send(
      this.authClient,
      { cmd: 'get-my-profile' },
      { userId: req.user.id }
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @Get('profile/:id')
  @ApiOperation({ summary: '특정 사용자 프로필 조회 (관리자/운영자 권한)' })
  @ApiResponse({ status: 200, description: '사용자 프로필 조회 성공', type: UserResponseDto })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async getUserProfile(@Param('id') userId: string, @Request() req: { user: RequestUser }) {
    return this.rpcClientProxyService.send(
      this.authClient,
      { cmd: 'get-user-profile' },
      { userId, user: req.user }
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Get('users')
  @ApiOperation({ summary: '모든 사용자 목록 조회 (관리자 권한)' })
  @ApiResponse({ status: 200, description: '사용자 목록 조회 성공', type: [UserResponseDto] }) // 배열 형태 명시
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  async getUsers(@Request() req: { user: RequestUser }) {
    // 실제 반환 타입에 맞게 ApiResponse 수정 필요 (페이지네이션 등 고려)
    return this.rpcClientProxyService.send(
      this.authClient,
      { cmd: 'get-users' }, 
      { user: req.user }
    );
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiBearerAuth()
  @Get('users/by-email/:email')
  @ApiOperation({ summary: '이메일로 사용자 조회 (관리자/운영자 권한)' })
  @ApiResponse({ status: 200, description: '사용자 조회 성공', type: UserResponseDto })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async getUserByEmail(@Param('email') email: string, @Request() req: { user: RequestUser }) {
    return this.rpcClientProxyService.send(
      this.authClient,
      { cmd: 'get-user-by-email' }, 
      { email, user: req.user }
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('users/:id')
  @ApiOperation({ summary: '사용자 정보 수정 (본인 또는 관리자 권한)' })
  @ApiResponse({ status: 200, description: '사용자 정보 수정 성공', type: UserResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청 형식' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
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
  @ApiBearerAuth()
  @Put('users/:id/role')
  @ApiOperation({ summary: '사용자 역할 변경 (관리자 권한)' })
  @ApiResponse({ status: 200, description: '사용자 역할 변경 성공', type: UserResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청 형식' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
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
  @ApiOperation({ summary: 'JWT 토큰 유효성 검증' })
  @ApiResponse({ status: 201, description: '토큰 유효성 검증 결과 반환', type: TokenValidationResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청 형식 또는 유효하지 않은 토큰' })
  async validateToken(@Body() data: TokenDto) {
    return this.rpcClientProxyService.send(
      this.authClient,
      { cmd: 'validate-token' }, 
      { token: data.token }
    );
  }
}
