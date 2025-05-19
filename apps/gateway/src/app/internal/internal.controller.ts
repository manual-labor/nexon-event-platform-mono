import { Controller, Get, Param, UseGuards, Post, Body } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RpcClientProxyService } from '../services/rpc-client-proxy.service';
import { InternalApiGuard } from '../guards/internal-api.guard';
import { Public } from '../decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Internal')
@Controller('internal')
@UseGuards(InternalApiGuard)
@Public() // InternalApiGuard와 함께 사용되므로, 실제 인증 방식에 따라 ApiSecurity 등 추가 고려
export class InternalController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private readonly rpcClientProxyService: RpcClientProxyService,
  ) {}

  @Get('users/by-email/:email')
  @ApiOperation({ summary: '이메일로 사용자 정보 조회 (내부 API)', description: '내부 서비스 간 통신을 위한 API입니다.' })
  @ApiResponse({ status: 200, description: '사용자 정보 조회 성공' })
  @ApiResponse({ status: 401, description: '내부 API 접근 권한 없음 (InternalApiGuard)' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async getUserByEmail(@Param('email') email: string) {
    return this.rpcClientProxyService.send(
      this.authClient,
      { cmd: 'get-user-by-email' },
      { email }
    );
  }
} 