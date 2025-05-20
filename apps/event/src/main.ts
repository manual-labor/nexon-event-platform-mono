import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';
import { GlobalExceptionFilter } from './app/filters/global-exception.filter';
import { 
  AppExceptionFilter, 
  ServiceCommunicationExceptionFilter, 
  UserNotFoundExceptionFilter 
} from './app/common/filters';
import { setTimezone } from './app/utils/date.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 타임존 설정 (기본값: Asia/Seoul)
  setTimezone();

  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: configService.get('EVENT_SERVICE_HOST', 'localhost'),
        port: configService.get('EVENT_SERVICE_PORT', 3002),
      },
    },
  );
  
  // 글로벌 예외 필터 적용
  microservice.useGlobalFilters(
    new AppExceptionFilter(),
    new ServiceCommunicationExceptionFilter(),
    new UserNotFoundExceptionFilter(),
    new GlobalExceptionFilter(),
  );
  
  await microservice.listen();
  Logger.log(
    `🚀 Event 마이크로서비스가 ${configService.get('EVENT_SERVICE_HOST', 'localhost')}:${configService.get('EVENT_SERVICE_PORT', 3002)}에서 실행 중입니다`
  );
}

bootstrap();

