import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        api: 'up',
        database: 'limited',
        redis: 'unavailable',
        neo4j: 'unavailable',
      },
      message: 'Townin Backend is running in LIMITED mode (without Docker)',
      note: 'Install Docker to enable all features',
    };
  }

  @Get('simple')
  simpleCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('ping')
  ping() {
    return {
      pong: true,
      timestamp: new Date().toISOString(),
    };
  }
}
