import { Controller, Get, Post, Body, Inject, Logger, BadRequestException, UnauthorizedException, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { MqttListenerService } from './mqtt-listener.service';
import { CarStatsService, CarState } from './car-stats.service';

// Define a whitelist of allowed car control actions
const ALLOWED_ACTIONS = ['lock', 'lights', 'climate', 'heating'];

// Regular expression for validating the topic format: car/{uuid}/{action}
const VALID_TOPIC_REGEX = /^car\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+$/;

interface MqttPublishDto {
  topic: string;
  payload: any;
}

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,
    private readonly mqttService: MqttListenerService,
    private readonly carStatsService: CarStatsService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

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

  @Post('mqtt/publish')
  publishMqtt(@Body() data: MqttPublishDto) {
    // Basic validation for required fields
    if (!data.topic) {
      throw new BadRequestException('Invalid or missing topic');
    }

    if (data.payload === undefined) {
      throw new BadRequestException('Missing payload');
    }

    // Validate topic format
    if (!VALID_TOPIC_REGEX.test(data.topic)) {
      this.logger.warn(`Rejected invalid topic format: ${data.topic}`);
      throw new BadRequestException('Invalid topic format. Expected pattern: car/{carId}/{action}');
    }

    // Extract action from topic
    const parts = data.topic.split('/');
    if (parts.length < 3) {
      throw new BadRequestException('Invalid topic structure');
    }

    const action = parts[2];

    // Check if action is allowed
    if (!ALLOWED_ACTIONS.includes(action)) {
      this.logger.warn(`Attempted to publish to disallowed action: ${action}`);
      throw new BadRequestException(`Action '${action}' is not allowed`);
    }

    // For car control actions, payload must be boolean
    if (typeof data.payload !== 'boolean') {
      this.logger.warn(`Invalid payload type for car control action: ${typeof data.payload}`);
      throw new BadRequestException('Payload must be a boolean value for car control actions');
    }

    this.logger.log(`Publishing to MQTT topic ${data.topic}: ${JSON.stringify(data.payload)}`);
    const result = this.mqttService.publishMessage(data.topic, data.payload);

    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    
    return result;
  }
}
