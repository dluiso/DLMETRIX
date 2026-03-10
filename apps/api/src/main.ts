import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const isDev = process.env.NODE_ENV !== 'production';

  // ── Security ──────────────────────────────────────────
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: isDev ? false : undefined,
    }),
  );

  // ── CORS ─────────────────────────────────────────────
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // ── Cookies ───────────────────────────────────────────
  app.use(cookieParser());

  // ── Global prefix ────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Validation ───────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Static files (screenshots) ────────────────────────
  // process.cwd() siempre apunta a apps/api/ independientemente de si se corre
  // con ts-node-dev (dev) o desde dist/ (prod), evitando el problema de __dirname
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // ── Swagger (dev only) ───────────────────────────────
  if (isDev) {
    const config = new DocumentBuilder()
      .setTitle('DLMETRIX API')
      .setDescription('Professional web audit platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth')
      .addTag('audits')
      .addTag('users')
      .addTag('plans')
      .addTag('admin')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`\n🚀 DLMETRIX API running on: http://localhost:${port}/api/v1`);
  if (isDev) console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
