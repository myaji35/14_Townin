import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCctvTable1701356800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create cctv table
    await queryRunner.query(`
      CREATE TABLE cctv (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        external_id VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,

        -- Geospatial
        location GEOMETRY(POINT, 4326) NOT NULL,
        h3_cell_id VARCHAR(20),
        address VARCHAR(500),

        -- Metadata
        region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
        installation_agency VARCHAR(100),
        installation_purpose VARCHAR(100),

        -- Sync
        last_synced_at TIMESTAMP,

        -- GraphRAG
        entity_type VARCHAR(50) DEFAULT 'Cctv',
        tags JSONB,

        -- Timestamps
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX idx_cctv_location ON cctv USING GIST(location);`);
    await queryRunner.query(`CREATE INDEX idx_cctv_h3_cell_id ON cctv(h3_cell_id);`);
    await queryRunner.query(`CREATE INDEX idx_cctv_region_id ON cctv(region_id);`);
    await queryRunner.query(`CREATE UNIQUE INDEX idx_cctv_external_id ON cctv(external_id);`);

    console.log('CCTV table created with spatial indexes');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS cctv CASCADE;`);
    console.log('CCTV table dropped');
  }
}
