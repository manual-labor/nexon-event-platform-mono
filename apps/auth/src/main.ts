import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';
import { GlobalExceptionFilter } from './app/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: configService.get('AUTH_SERVICE_HOST', 'localhost'),
        port: configService.get('AUTH_SERVICE_PORT', 3001),
      },
    },
  );
  
  microservice.useGlobalFilters(new GlobalExceptionFilter());
  
  await microservice.listen();
  Logger.log(
    `🚀 Auth 마이크로서비스가 ${configService.get('AUTH_SERVICE_HOST', 'localhost')}:${configService.get('AUTH_SERVICE_PORT', 3001)}에서 실행 중입니다`
  );
}

bootstrap();
