import { NestFactory } from '@nestjs/core';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationError } from 'class-validator';
import cookieParser from 'cookie-parser';

// Create custom exception factory for validation pipe
function exceptionFactory(errors: ValidationError[]) {
  const firstError = errors[0];
  return new UnprocessableEntityException(Object.values(firstError.constraints)[0]);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // Enable cookie parsing
  app.use(cookieParser());

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
