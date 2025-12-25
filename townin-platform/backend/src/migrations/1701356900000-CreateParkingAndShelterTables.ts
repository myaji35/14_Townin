import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateParkingAndShelterTables1701356900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create parking table
    await queryRunner.query(`
      CREATE TABLE parking (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        external_id VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,

        -- Geospatial
        location GEOMETRY(POINT, 4326) NOT NULL,
        h3_cell_id VARCHAR(20),
        address VARCHAR(500),

        -- Parking Info
        total_spaces INT NOT NULL,
        available_spaces INT,
        operation_hours VARCHAR(100),
        fee_info TEXT,
        parking_type VARCHAR(50),
        is_paid BOOLEAN DEFAULT TRUE,

        -- Metadata
        region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
        phone VARCHAR(20),

        -- Sync
        static_data_synced_at TIMESTAMP,
        realtime_data_synced_at TIMESTAMP,

        -- GraphRAG
        entity_type VARCHAR(50) DEFAULT 'Parking',
        tags JSONB,

        -- Timestamps
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create shelters table
    await queryRunner.query(`
      CREATE TABLE shelters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        external_id VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,

        -- Geospatial
        location GEOMETRY(POINT, 4326) NOT NULL,
        h3_cell_id VARCHAR(20),
        address VARCHAR(500),

        -- Shelter Info
        capacity INT,
        facility_type VARCHAR(100),
        area_sqm DECIMAL(10, 2),

        -- Metadata
        region_id UUID REFERENCES regions(id) ON DELETE SET NULL,

        -- Sync
        last_synced_at TIMESTAMP,

        -- GraphRAG
        entity_type VARCHAR(50) DEFAULT 'Shelter',
        tags JSONB,

        -- Timestamps
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes for parking
    await queryRunner.query(`CREATE INDEX idx_parking_location ON parking USING GIST(location);`);
    await queryRunner.query(`CREATE INDEX idx_parking_h3_cell_id ON parking(h3_cell_id);`);
    await queryRunner.query(`CREATE INDEX idx_parking_region_id ON parking(region_id);`);
    await queryRunner.query(`CREATE INDEX idx_parking_available_spaces ON parking(available_spaces);`);
    await queryRunner.query(`CREATE UNIQUE INDEX idx_parking_external_id ON parking(external_id);`);

    // Create indexes for shelters
    await queryRunner.query(`CREATE INDEX idx_shelters_location ON shelters USING GIST(location);`);
    await queryRunner.query(`CREATE INDEX idx_shelters_h3_cell_id ON shelters(h3_cell_id);`);
    await queryRunner.query(`CREATE INDEX idx_shelters_region_id ON shelters(region_id);`);
    await queryRunner.query(`CREATE UNIQUE INDEX idx_shelters_external_id ON shelters(external_id);`);

    console.log('Parking and Shelter tables created with spatial indexes');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS parking CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS shelters CASCADE;`);
    console.log('Parking and Shelter tables dropped');
  }
}
