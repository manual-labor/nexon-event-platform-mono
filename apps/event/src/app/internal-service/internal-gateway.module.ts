import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AuthGatewayClientService } from './auth-gateway-client.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
  ],
  providers: [AuthGatewayClientService],
  exports: [AuthGatewayClientService],
})
export class InternalGatewayModule {} 