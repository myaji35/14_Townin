import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRegionTable1701356500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create regions table
    await queryRunner.query(`
      CREATE TABLE regions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(10) UNIQUE NOT NULL,
        name_ko VARCHAR(100) NOT NULL,
        name_en VARCHAR(100),
        level VARCHAR(20) NOT NULL CHECK (level IN ('city', 'district', 'neighborhood')),
        parent_id UUID REFERENCES regions(id) ON DELETE SET NULL,

        -- Geospatial columns
        boundary GEOMETRY(POLYGON, 4326),
        center_point GEOMETRY(POINT, 4326),

        -- Metadata
        population INT,
        area_sqm DECIMAL(12, 2),

        -- GraphRAG fields
        entity_type VARCHAR(50) DEFAULT 'Region',
        tags JSONB,

        -- Timestamps
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX idx_regions_code ON regions(code);`);
    await queryRunner.query(`CREATE INDEX idx_regions_parent_id ON regions(parent_id);`);
    await queryRunner.query(`CREATE INDEX idx_regions_level ON regions(level);`);
    await queryRunner.query(`CREATE INDEX idx_regions_boundary ON regions USING GIST(boundary);`);
    await queryRunner.query(`CREATE INDEX idx_regions_center_point ON regions USING GIST(center_point);`);

    // Insert seed data for Seoul (서울특별시)
    await queryRunner.query(`
      INSERT INTO regions (code, name_ko, name_en, level, boundary, center_point, population, area_sqm, tags) VALUES
      -- City level: 서울특별시
      ('1100000000', '서울특별시', 'Seoul', 'city',
       ST_GeomFromText('POLYGON((126.7 37.4, 127.2 37.4, 127.2 37.7, 126.7 37.7, 126.7 37.4))', 4326),
       ST_GeomFromText('POINT(126.9780 37.5665)', 4326),
       9668000, 605250000, '{"capital": true, "metro": true}'),

      -- District level: 강남구
      ('1168000000', '강남구', 'Gangnam-gu', 'district',
       ST_GeomFromText('POLYGON((127.0 37.48, 127.1 37.48, 127.1 37.53, 127.0 37.53, 127.0 37.48))', 4326),
       ST_GeomFromText('POINT(127.0495 37.5172)', 4326),
       561052, 39500000, '{"district_type": "gu"}'),

      -- District level: 종로구
      ('1111000000', '종로구', 'Jongno-gu', 'district',
       ST_GeomFromText('POLYGON((126.95 37.56, 127.0 37.56, 127.0 37.60, 126.95 37.60, 126.95 37.56))', 4326),
       ST_GeomFromText('POINT(126.9780 37.5730)', 4326),
       151257, 23910000, '{"district_type": "gu", "historic": true}'),

      -- District level: 서초구
      ('1165000000', '서초구', 'Seocho-gu', 'district',
       ST_GeomFromText('POLYGON((127.0 37.46, 127.1 37.46, 127.1 37.51, 127.0 37.51, 127.0 37.46))', 4326),
       ST_GeomFromText('POINT(127.0323 37.4837)', 4326),
       444961, 47000000, '{"district_type": "gu"}')
    `);

    // Set parent_id for districts (all belong to Seoul)
    await queryRunner.query(`
      UPDATE regions
      SET parent_id = (SELECT id FROM regions WHERE code = '1100000000')
      WHERE code IN ('1168000000', '1111000000', '1165000000');
    `);

    console.log('Region table created and seeded with Seoul data');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS regions CASCADE;`);
    console.log('Region table dropped');
  }
}
