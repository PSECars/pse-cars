import dotenv from 'dotenv';

const dotenvFile = dotenv.config({path: '../../local.env'})
if (dotenvFile.error) {
    console.info("No .env file found.")
} else {
    console.info("Successfully loaded local.env file")
}

import mqtt from 'mqtt';
import coordinateService, { Subscriber } from './service/coordinateService';
import { Coordinate } from './types/Coordinate';

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const MQTT_USERNAME = process.env.MQTT_USERNAME!;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD!;
const MQTT_TOPIC = process.env.MQTT_TOPIC!;

if (!MQTT_USERNAME || !MQTT_PASSWORD || !MQTT_TOPIC) {
    console.error('MQTT credentials or topic not configured in environment variables');
    process.exit(1);
}

const mqttClient = mqtt.connect(MQTT_BROKER_URL, {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD
})

mqttClient.on('connect', () => {
  console.info(`Connected to MQTT broker at ${MQTT_BROKER_URL}`);
});

mqttClient.on('error', (err) => {
  console.error('MQTT connection error:', err);
});

mqttClient.on('close', () => {
  console.info('MQTT connection closed');
});

/**
 * MQTT Coordinate Publisher - Implements the Subscriber interface to publish coordinates to MQTT
 */
class MqttCoordinatePublisher implements Subscriber {
  notify(coordinate: Coordinate): void {
    try {
      const payload = JSON.stringify(coordinate);
      mqttClient.publish(MQTT_TOPIC, payload, { qos: 0 }, (err) => {
        if (err) {
          console.error('Failed to publish coordinate:', err);
        } else {
          console.info(`Published to ${MQTT_TOPIC}: ${payload}`);
        }
      });
    } catch (error) {
      console.error('Error while publishing coordinate:', error);
    }
  }
}

coordinateService.subscribe(new MqttCoordinatePublisher());
console.info('Car position mock service started. Publishing coordinates to MQTT topic:', MQTT_TOPIC);
