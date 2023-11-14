import { join } from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import { ValidationError } from 'class-validator';
import { NestFactory } from '@nestjs/core';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

// Create custom exception factory for validation pipe
function exceptionFactory(errors: ValidationError[]) {
  const firstError = errors[0];
  return new UnprocessableEntityException(Object.values(firstError.constraints)[0]);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Get configuration service instance
  const config = app.get(ConfigService);

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

  // Serve the favicon
  app.use('/favicon.ico', express.static(join(__dirname, '..', 'favicon.ico')));

  // Enable cookie parsing
  app.use(cookieParser());

  // Use global pipes for validation with custom exception factory.
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      whitelist: true,
      transform: true,
      exceptionFactory,
    }),
  );

  await app.listen(config.get('PORT', 3000));
}
bootstrap();
