import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './app/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  app.enableCors();

  app.setGlobalPrefix('v1');
  
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  Logger.log(
    `🚀 Gateway 서버가 http://localhost:${port} 에서 실행 중입니다`
  );
}

bootstrap();
