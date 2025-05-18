import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AuthClientService } from './auth-client.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
  ],
  providers: [AuthClientService],
  exports: [AuthClientService],
})
export class GatewayClientModule {} 