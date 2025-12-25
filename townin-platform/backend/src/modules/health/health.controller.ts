import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * General health check
   */
  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    const isDbHealthy = await this.checkDatabase();

    return {
      status: isDbHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: isDbHealthy ? 'up' : 'down',
      uptime: process.uptime(),
    };
  }

  /**
   * Database health check
   */
  @Get('database')
  @ApiOperation({ summary: 'Database health check' })
  @ApiResponse({ status: 200, description: 'Database is healthy' })
  async databaseHealth() {
    const isHealthy = await this.checkDatabase();

    return {
      status: isHealthy ? 'up' : 'down',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Check database connection
   */
  private async checkDatabase(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }
}
