import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';

class Application {
  private readonly logger = new Logger(Application.name);

  constructor(private readonly configService: ConfigService) { }

  async bootstrap(app): Promise<void> {
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);

    const port = this.configService.get<number>('PORT', 3001);
    await app.listen(port);

    this.logger.log(
      `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
    );
  }
}

async function main() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const application = new Application(configService);
  await application.bootstrap(app);
}

main().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});

