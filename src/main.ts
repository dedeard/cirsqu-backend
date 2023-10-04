import { NestFactory } from '@nestjs/core';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { AppModule } from './app.module';
import { ValidationError } from 'class-validator';

// Initialize Firebase Admin App
function initAdminApp(config: ConfigService) {
  const credentials: admin.ServiceAccount = {
    projectId: config.getOrThrow<string>('FBA_PROJECT_ID'),
    clientEmail: config.getOrThrow<string>('FBA_CLIENT_EMAIL'),
    privateKey: config.getOrThrow<string>('FBA_PRIVATE_KEY'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(credentials),
    storageBucket: config.getOrThrow<string>('FBA_STORAGE_BUCKET'),
  });
}

// Create custom exception factory for validation pipe
function exceptionFactory(errors: ValidationError[]) {
  const firstError = errors[0];
  return new UnprocessableEntityException(Object.values(firstError.constraints)[0]);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get configuration service instance
  const config = app.get(ConfigService);

  // Initialize Firebase Admin App with configurations
  initAdminApp(config);

  // Get allowed origins for CORS configuration
  const allowedOrigins = config.getOrThrow<string>('CORS_ORIGINS').split(',');

  // Enable CORS with dynamic origin based on the request's origin header.
  app.enableCors({
    credentials: true,
    origin(origin, cb) {
      if (allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
  });

  // Use global pipes for validation with custom exception factory.
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      whitelist: true,
      exceptionFactory,
    }),
  );

  await app.listen(config.get('PORT', 3000));
}
bootstrap();
