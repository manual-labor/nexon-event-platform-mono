import { Controller, Get, Param, UseGuards, Post, Body } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RpcClientProxyService } from '../services/rpc-client-proxy.service';
import { InternalApiGuard } from '../guards/internal-api.guard';
import { Public } from '../decorators/public.decorator';

@Controller('internal')
@UseGuards(InternalApiGuard)
@Public()
export class InternalController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private readonly rpcClientProxyService: RpcClientProxyService,
  ) {}

  @Get('users/by-email/:email')
  async getUserByEmail(@Param('email') email: string) {
    return this.rpcClientProxyService.send(
      this.authClient,
      { cmd: 'get-user-by-email' },
      { email }
    );
  }
} 