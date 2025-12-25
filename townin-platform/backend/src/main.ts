import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Increase body size limit for file uploads (base64 images)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Manual CORS middleware
  app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    }

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  });

  // Global prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Townin Platform API')
    .setDescription(
      'Privacy-first hyper-local Life OS & Insurance GraphRAG Platform\n\n' +
      '## Phase 1 - Traffic Acquisition\n' +
      '- Public data safety maps (CCTV, parking, shelters)\n' +
      '- Digital signboard app for partners\n' +
      '- Digital flyer viewer\n' +
      '- User points & rewards system\n\n' +
      '## Key Features\n' +
      '- Three-Hub Architecture (residence, workplace, family home)\n' +
      '- H3 Geospatial indexing for location-based queries\n' +
      '- Role-based access control (User, Merchant, Admin)\n' +
      '- Real-time analytics and event tracking',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication & OAuth (Kakao, Naver, Google)')
    .addTag('users', 'User profile, hubs, and dashboard')
    .addTag('merchants', 'Merchant profile and business management')
    .addTag('flyers', 'Digital flyer creation, viewing, and interactions')
    .addTag('signboards', 'Digital signboard management')
    .addTag('points', 'Points & rewards system')
    .addTag('public-data', 'Public safety data (CCTV, Parking, Shelters)')
    .addTag('notifications', 'Push notifications and preferences')
    .addTag('analytics', 'Event tracking and analytics')
    .addTag('files', 'File upload and S3 management')
    .addTag('admin', 'Admin dashboard and management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Townin Platform API is running on: http://localhost:${port}`);
  console.log(`📖 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
