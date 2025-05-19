import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './app/filters/global-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  app.enableCors();

  app.setGlobalPrefix('v1');
  
  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Nexon Event Platform API')
    .setDescription('Nexon Event Platform API 문서입니다.')
    .setVersion('1.0')
    .addTag('events', '이벤트 관련 API')
    .addTag('auth', '인증 관련 API')
    .addBearerAuth() // JWT 인증을 위한 Bearer Auth 추가
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/api-docs', app, document); // '/api' 경로에 Swagger UI 설정

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
