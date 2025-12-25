import { MigrationInterface, QueryRunner } from 'typeorm';

export class OptimizeSpatialIndexes1701356600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add additional composite indexes for common query patterns

    // Region optimization: composite index for level + parent_id queries
    await queryRunner.query(`
      CREATE INDEX idx_regions_level_parent ON regions(level, parent_id);
    `);

    // Region optimization: partial indexes for each level
    await queryRunner.query(`
      CREATE INDEX idx_regions_city_level ON regions(id) WHERE level = 'city';
    `);
    await queryRunner.query(`
      CREATE INDEX idx_regions_district_level ON regions(id) WHERE level = 'district';
    `);
    await queryRunner.query(`
      CREATE INDEX idx_regions_neighborhood_level ON regions(id) WHERE level = 'neighborhood';
    `);

    // Grid cells optimization: composite index for region queries with counts
    await queryRunner.query(`
      CREATE INDEX idx_grid_cells_region_activity ON grid_cells(region_id, last_activity_at);
    `);

    // Grid cells optimization: index for cells with high activity
    await queryRunner.query(`
      CREATE INDEX idx_grid_cells_high_activity ON grid_cells(user_count)
      WHERE user_count > 0 OR flyer_count > 0;
    `);

    // Add BRIN index for timestamp columns (better for time-series queries)
    await queryRunner.query(`
      CREATE INDEX idx_grid_cells_created_brin ON grid_cells USING BRIN(created_at);
    `);

    // Create materialized view for region statistics (pre-aggregated)
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW region_stats AS
      SELECT
        r.id AS region_id,
        r.code,
        r.name_ko,
        r.level,
        COUNT(DISTINCT gc.h3_index) AS grid_cell_count,
        COALESCE(SUM(gc.user_count), 0) AS total_users,
        COALESCE(SUM(gc.flyer_count), 0) AS total_flyers,
        MAX(gc.last_activity_at) AS last_activity_at
      FROM regions r
      LEFT JOIN grid_cells gc ON gc.region_id = r.id
      GROUP BY r.id, r.code, r.name_ko, r.level;
    `);

    // Create index on materialized view
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_region_stats_region_id ON region_stats(region_id);
    `);
    await queryRunner.query(`
      CREATE INDEX idx_region_stats_level ON region_stats(level);
    `);

    // Analyze tables to update statistics for query planner
    await queryRunner.query(`ANALYZE regions;`);
    await queryRunner.query(`ANALYZE grid_cells;`);

    console.log('Spatial query optimization completed');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop materialized view
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS region_stats;`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_regions_level_parent;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_regions_city_level;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_regions_district_level;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_regions_neighborhood_level;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_grid_cells_region_activity;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_grid_cells_high_activity;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_grid_cells_created_brin;`);

    console.log('Spatial query optimization rolled back');
  }
}
