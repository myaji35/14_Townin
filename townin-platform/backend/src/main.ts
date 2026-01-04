import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
    // Ignore DB connection errors for minimal startup
    abortOnError: false,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'https://townin-cb270.web.app'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Townin Platform API')
    .setDescription('Townin Hyper-local Life OS & Insurance GraphRAG Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('flyers', 'Digital flyers')
    .addTag('merchants', 'Merchant management')
    .addTag('regions', 'Region and location data')
    .addTag('health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4030;

  try {
    await app.listen(port);
    console.log('');
    console.log('🚀 ========================================');
    console.log(`🎯 Townin Backend Server Running!`);
    console.log(`📡 http://localhost:${port}/api/v1`);
    console.log(`📚 API Docs: http://localhost:${port}/api/docs`);
    console.log(`💚 Health Check: http://localhost:${port}/api/v1/health`);
    console.log('🚀 ========================================');
    console.log('');
    console.log('⚠️  Running in LIMITED mode (without Redis/Neo4j)');
    console.log('   Some features may not work properly.');
    console.log('   Install Docker to enable all features.');
    console.log('');
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

bootstrap();
