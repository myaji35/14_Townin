import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSpatialIndexes1701000100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add spatial index to grid_cells.location
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_grid_cells_location
      ON grid_cells USING GIST (location);
    `);

    // Add spatial index to grid_cells.boundary
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_grid_cells_boundary
      ON grid_cells USING GIST (boundary);
    `);

    // Add spatial index to user_locations.center_point (if exists)
    const userLocationsExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'user_locations'
      );
    `);

    if (userLocationsExists[0].exists) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_user_locations_center_point
        ON user_locations USING GIST (center_point);
      `);
    }

    // Add spatial indexes to regions table (if exists)
    const regionsExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'regions'
      );
    `);

    if (regionsExists[0].exists) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_regions_boundary
        ON regions USING GIST (boundary);
      `);

      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_regions_center_point
        ON regions USING GIST (center_point);
      `);
    }

    // Add spatial index to flyers.location (if exists)
    const flyersExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'flyers'
      );
    `);

    if (flyersExists[0].exists) {
      // Check if location column exists
      const locationColumnExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_name = 'flyers' AND column_name = 'location'
        );
      `);

      if (!locationColumnExists[0].exists) {
        // Add location column to flyers
        await queryRunner.query(`
          ALTER TABLE flyers
          ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);
        `);
      }

      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_flyers_location
        ON flyers USING GIST (location);
      `);
    }

    console.log('Spatial indexes created successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_grid_cells_location;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_grid_cells_boundary;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_locations_center_point;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_regions_boundary;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_regions_center_point;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_flyers_location;`);
  }
}
