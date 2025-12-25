import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { RegionsSeeder } from './regions.seeder';
import { GridCellsSeeder } from './grid-cells.seeder';
import { PublicDataSeeder } from './public-data.seeder';
import { Logger } from '@nestjs/common';

/**
 * Database Seeding Script
 * Usage:
 *   npm run seed                - Run all seeders
 *   npm run seed:regions        - Run only regions seeder
 *   npm run seed:grid-cells     - Run only grid cells seeder
 *   npm run seed:public-data    - Run only public data seeder (CCTV, Parking, Shelter)
 *   npm run seed:clear          - Clear all seeded data
 *   npm run seed:stats          - Show seeding statistics
 */

const logger = new Logger('DatabaseSeeder');

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const command = process.argv[2] || 'all';

  try {
    logger.log('🌱 Starting database seeding...');

    const regionsSeeder = app.get(RegionsSeeder);
    const gridCellsSeeder = app.get(GridCellsSeeder);
    const publicDataSeeder = app.get(PublicDataSeeder);

    switch (command) {
      case 'all':
        logger.log('Running all seeders...');
        await regionsSeeder.seed();
        await gridCellsSeeder.seed();
        await publicDataSeeder.seed();
        break;

      case 'regions':
        logger.log('Running regions seeder only...');
        await regionsSeeder.seed();
        break;

      case 'grid-cells':
        logger.log('Running grid cells seeder only...');
        await gridCellsSeeder.seed();
        break;

      case 'public-data':
        logger.log('Running public data seeder only...');
        await publicDataSeeder.seed();
        break;

      case 'clear':
        logger.warn('⚠️  Clearing all seeded data...');
        await publicDataSeeder.clear();
        await gridCellsSeeder.clear();
        await regionsSeeder.clear();
        logger.log('✅ All seeded data cleared');
        break;

      case 'stats':
        logger.log('📊 Gathering seeding statistics...');
        const regionStats = await regionsSeeder.getStats();
        const gridCellStats = await gridCellsSeeder.getStats();
        const publicDataStats = await publicDataSeeder.getStats();

        logger.log('\n=== Regions Statistics ===');
        logger.log(`Total Regions: ${regionStats.total}`);
        logger.log(`  - Cities: ${regionStats.cities}`);
        logger.log(`  - Districts: ${regionStats.districts}`);
        logger.log(`  - Neighborhoods: ${regionStats.neighborhoods}`);

        logger.log('\n=== Grid Cells Statistics ===');
        logger.log(`Total Grid Cells: ${gridCellStats.total}`);
        logger.log(`Active Cells: ${gridCellStats.active}`);

        logger.log('\n=== Public Data Statistics ===');
        logger.log(`Total CCTV: ${publicDataStats.cctv}`);
        logger.log(`Total Parking: ${publicDataStats.parking}`);
        logger.log(`Total Shelter: ${publicDataStats.shelter}`);
        break;

      default:
        logger.error(`Unknown command: ${command}`);
        logger.log('Available commands: all, regions, grid-cells, public-data, clear, stats');
        process.exit(1);
    }

    logger.log('✅ Database seeding completed successfully!');
  } catch (error) {
    logger.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
