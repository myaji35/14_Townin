import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
// import { SecurityGuardsModule } from './modules/security-guards/security-guards.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { GridCellsModule } from './modules/grid-cells/grid-cells.module';
import { FlyersModule } from './modules/flyers/flyers.module';
// import { AdminModule } from './modules/admin/admin.module'; // Temporarily disabled due to compilation errors
import { RegionsModule } from './modules/regions/regions.module';
// import { GeocodingModule } from './modules/geocoding/geocoding.module';
// import { UserLocationsModule } from './modules/user-locations/user-locations.module';
// import { StatisticsModule } from './modules/statistics/statistics.module';
// import { MapsModule } from './modules/maps/maps.module';
// import { PublicDataModule } from './modules/public-data/public-data.module'; // Temporarily disabled (requires @nestjs/schedule)
// import { FilesModule } from './modules/files/files.module'; // Temporarily disabled (requires @nestjs/schedule)
// import { NotificationsModule } from './modules/notifications/notifications.module'; // Temporarily disabled (WebSocket issues)
// import { AnalyticsModule } from './modules/analytics/analytics.module'; // Temporarily disabled (requires @nestjs/schedule)
import { HealthModule } from './modules/health/health.module';
// import { FavoritesModule } from './modules/favorites/favorites.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RedisModule } from './modules/redis/redis.module';
import { SeedModule } from './database/seeds/seed.module';
import { Neo4jModule } from './modules/neo4j/neo4j.module';
import { InfluxDBModule } from './modules/influxdb/influxdb.module';
import { GraphRAGModule } from './modules/graphrag/graphrag.module';
import { IoTSensorsModule } from './modules/iot-sensors/iot-sensors.module';
import { FlushModule } from './flush/flush.module';
import { AvatarModule } from './avatar/avatar.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    /*
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const password = configService.get('DB_PASSWORD');
        const config = {
          type: 'postgres' as const,
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get('DB_PORT', 15432),
          username: configService.get('DB_USERNAME', 'townin'),
          password: password && password.length > 0 ? password : undefined,
          database: configService.get('DB_DATABASE', 'townin-db'),
          entities: [__dirname + '/!**!/!*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/!*{.ts,.js}'],
          synchronize: configService.get('NODE_ENV') === 'development',
          logging: configService.get('NODE_ENV') === 'development',
        };

        console.log('TypeORM Database Config:', {
          host: config.host,
          port: config.port,
          username: config.username,
          password: config.password === undefined ? 'undefined' : '***',
          database: config.database,
        });

        return config;
      },
    }),
    */
    EventEmitterModule.forRoot(),
    // Temporarily disabled - requires Docker
    // RedisModule,
    // Neo4jModule,
    // InfluxDBModule,
    // GraphRAGModule,
    // IoTSensorsModule,
    // AuthModule, // Requires RedisModule
    // UsersModule,
    // SecurityGuardsModule, // Temporarily disabled
    // MerchantsModule,
    // GridCellsModule,
    // FlyersModule,
    // AdminModule, // Temporarily disabled
    // RegionsModule,
    // GeocodingModule, // Temporarily disabled
    // UserLocationsModule, // Temporarily disabled
    // StatisticsModule, // Temporarily disabled
    // MapsModule, // Temporarily disabled
    // PublicDataModule, // Temporarily disabled
    // FilesModule, // Temporarily disabled
    // NotificationsModule, // Temporarily disabled
    // AnalyticsModule, // Temporarily disabled
    HealthModule,
    // FavoritesModule, // Temporarily disabled
    // SeedModule, // Seeding module for database initialization
    FlushModule,
    AvatarModule,
  ],
})
export class AppModule { }
