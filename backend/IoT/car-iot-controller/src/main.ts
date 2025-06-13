import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // Create the application with configured logging level
  const app = await NestFactory.create(AppModule, {
    logger: process.env.LOG_LEVEL 
      ? [process.env.LOG_LEVEL as any, 'error'] 
      : ['log', 'error'],
  });

  // CORS
    app.enableCors({
        origin: process.env.CORS_ORIGIN || '*', // Allow all origins by default
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type, Authorization',
    });

  // Enable shutdown hooks for graceful termination
  app.enableShutdownHooks();

  // Start HTTP + WebSocket server with dynamic port
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`HTTP & WS server listening on http://localhost:${port}`);
  
  // Handle termination signals for Docker
  const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  signals.forEach(signal => {
    process.on(signal, async () => {
      logger.log(`Received ${signal}, shutting down gracefully...`);
      await app.close();
      logger.log('Application terminated');
      process.exit(0);
    });
  });
}

bootstrap();
