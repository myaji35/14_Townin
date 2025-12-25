import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserLocationsTable1701356700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create user_locations table
    await queryRunner.query(`
      CREATE TABLE user_locations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        hub_type VARCHAR(20) NOT NULL CHECK (hub_type IN ('residence', 'workplace', 'family_home')),

        -- H3 Grid Cell (Privacy-first)
        h3_index VARCHAR(20) NOT NULL REFERENCES grid_cells(h3_index),

        -- Region association
        region_id UUID REFERENCES regions(id) ON DELETE SET NULL,

        -- Center point (approximate, for display only)
        center_point GEOMETRY(POINT, 4326),

        -- Metadata
        label VARCHAR(100),
        is_primary BOOLEAN DEFAULT FALSE,
        tags JSONB,

        -- GraphRAG
        entity_type VARCHAR(50) DEFAULT 'UserLocation',

        -- Timestamps
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),

        -- Constraint: Each user can have only one location per hub type
        CONSTRAINT uq_user_hub_type UNIQUE (user_id, hub_type)
      );
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX idx_user_locations_user_id ON user_locations(user_id);`);
    await queryRunner.query(`CREATE INDEX idx_user_locations_hub_type ON user_locations(hub_type);`);
    await queryRunner.query(`CREATE INDEX idx_user_locations_region_id ON user_locations(region_id);`);
    await queryRunner.query(`CREATE INDEX idx_user_locations_h3_index ON user_locations(h3_index);`);
    await queryRunner.query(`CREATE INDEX idx_user_locations_center_point ON user_locations USING GIST(center_point);`);

    // Create composite index for common queries
    await queryRunner.query(`
      CREATE INDEX idx_user_locations_user_hub ON user_locations(user_id, hub_type);
    `);

    console.log('UserLocations table created with 3-Hub constraint');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS user_locations CASCADE;`);
    console.log('UserLocations table dropped');
  }
}
