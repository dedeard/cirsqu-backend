import { NestFactory } from '@nestjs/core';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    credentials: true,
    origin(origin, cb) {
      const allowedOrigins = app.get(ConfigService).get<string>('CORS_ORIGINS', '*').split(',');
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins[0] === '*') {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      whitelist: true,
      exceptionFactory(errors) {
        const errorMessages: any = {};
        for (const i in errors) {
          errorMessages[errors[i].property] = Object.values(errors[i].constraints)[0];
        }
        return new UnprocessableEntityException({ errors: errorMessages });
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();
