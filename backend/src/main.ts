import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    instrument: ObserveInstrument,
  });
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.useBodyParser('json', { limit: '5mb' });
  //app.setGlobalPrefix('api/v1', { exclude: [''] });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.enableCors(
      {
        "origin": true,
        "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
        "preflightContinue": false,
        credentials: true
      }
    );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
