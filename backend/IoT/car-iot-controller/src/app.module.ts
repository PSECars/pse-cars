import { Module } from '@nestjs/common';
import { MqttListenerService } from './mqtt-listener.service';
import { CarStatsService } from './car-stats.service';
import { WebsocketGateway } from './websocket.gateway';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  controllers: [AppController],
  providers: [
    AppService,
    MqttListenerService,
    CarStatsService,
    WebsocketGateway,
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    })
  ]
})
export class AppModule {}
