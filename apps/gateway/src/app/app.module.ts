import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from "./auth/auth.controller";
import { EventController } from "./event/event.controller";
import { RpcClientProxyService } from './services/rpc-client-proxy.service';
import { RoleValidationService } from './services/role-validation.service';
import { join } from 'path';
import { existsSync } from 'fs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          // Docker에서 실행되는 경우와 로컬에서 실행되는 경우의 proto 파일 경로 처리
          let protoPath = join(__dirname, '../proto/auth.proto');
          
          // 로컬 경로가 없으면 Docker 환경의 경로 사용
          if (!existsSync(protoPath)) {
            protoPath = join(process.cwd(), 'proto/auth.proto');
          }
          
          return {
            transport: Transport.GRPC,
            options: {
              package: 'auth',
              protoPath,
              url: `${configService.get('AUTH_SERVICE_HOST', 'localhost')}:${configService.get('AUTH_SERVICE_PORT', 3001)}`,
            },
          };
        },
      },
      {
        name: 'EVENT_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          // Docker에서 실행되는 경우와 로컬에서 실행되는 경우의 proto 파일 경로 처리
          let protoPath = join(__dirname, '../proto/event.proto');
          
          // 로컬 경로가 없으면 Docker 환경의 경로 사용
          if (!existsSync(protoPath)) {
            protoPath = join(process.cwd(), 'proto/event.proto');
          }
          
          return {
            transport: Transport.GRPC,
            options: {
              package: 'event',
              protoPath,
              url: `${configService.get('EVENT_SERVICE_HOST', 'localhost')}:${configService.get('EVENT_SERVICE_PORT', 3002)}`,
            },
          };
        },
      },
    ]),
  ],
  controllers: [AppController, AuthController, EventController],
  providers: [
    AppService,
    RpcClientProxyService,
    RoleValidationService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
