import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';
import { GlobalExceptionFilter } from './app/filters/global-exception.filter';
import { join } from 'path';
import { existsSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Docker에서 실행되는 경우와 로컬에서 실행되는 경우의 proto 파일 경로 처리
  let protoPath = join(__dirname, '../proto/event.proto');
  
  // 로컬 경로가 없으면 Docker 환경의 경로 사용
  if (!existsSync(protoPath)) {
    protoPath = join(process.cwd(), 'proto/event.proto');
  }

  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'event',
        protoPath,
        url: `${configService.get('EVENT_SERVICE_HOST', 'localhost')}:${configService.get('EVENT_SERVICE_PORT', 3002)}`,
      },
    },
  );
  
  // 글로벌 예외 필터 적용
  microservice.useGlobalFilters(new GlobalExceptionFilter());

  microservice.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  
  await microservice.listen();
  Logger.log(
    `🚀 Event 마이크로서비스가 ${configService.get('EVENT_SERVICE_HOST', 'localhost')}:${configService.get('EVENT_SERVICE_PORT', 3002)}에서 gRPC로 실행 중입니다`
  );
}

bootstrap();

