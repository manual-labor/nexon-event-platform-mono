import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { ParticipationModule } from './events/participation/paricipation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI_EVENT', 'mongodb://mongo:27017/eventdb?replicaSet=rs0'),
      }),
    }),
    HttpModule,
    EventsModule,
    ParticipationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
