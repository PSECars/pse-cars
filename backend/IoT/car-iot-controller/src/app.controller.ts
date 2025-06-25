import { Controller, Get, Post, Body, Param, Logger, BadRequestException } from '@nestjs/common';
import { MqttListenerService } from './mqtt-listener.service';
import { CarStatsService, CarState } from './car-stats.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly mqttService: MqttListenerService,
    private readonly carStatsService: CarStatsService,
  ) {}

  @Get('health')
  getHealth() {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        mqtt: this.mqttService.getHealth(),
        stats: this.carStatsService.getHealth(),
      }
    };
  }

  @Get('car/:carId/stats')
  getCarStats(@Param('carId') carId: string): CarState {
    return this.carStatsService.getCarStats(carId);
  }

  // --- Dedicated endpoints for car control actions ---

  @Post('car/:carId/lock')
  setCarLock(@Param('carId') carId: string, @Body('value') value: boolean) {

    // Could be checked, but not necessary for boolean values
    /*if (typeof value !== 'boolean') {
      throw new BadRequestException('Value must be boolean');
    }*/

    const topic = `car/${carId}/lock`;
    this.logger.log(`Publishing lock to ${topic}: ${value}`);
    const result = this.mqttService.publishMessage(topic, value);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return result;
  }

  @Post('car/:carId/lights')
  setCarLights(@Param('carId') carId: string, @Body('value') value: boolean) {
    const topic = `car/${carId}/lights`;
    this.logger.log(`Publishing lights to ${topic}: ${value}`);
    const result = this.mqttService.publishMessage(topic, value);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return result;
  }

  @Post('car/:carId/climate')
  setCarClimate(@Param('carId') carId: string, @Body('value') value: boolean) {
    const topic = `car/${carId}/climate`;
    this.logger.log(`Publishing climate to ${topic}: ${value}`);
    const result = this.mqttService.publishMessage(topic, value);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return result;
  }

  @Post('car/:carId/heating')
  setCarHeating(@Param('carId') carId: string, @Body('value') value: boolean) {
    const topic = `car/${carId}/heating`;
    this.logger.log(`Publishing heating to ${topic}: ${value}`);
    const result = this.mqttService.publishMessage(topic, value);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return result;
  }
}
