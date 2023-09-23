import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
