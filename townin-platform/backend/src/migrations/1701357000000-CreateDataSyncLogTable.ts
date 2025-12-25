import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDataSyncLogTable1701357000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE data_sync_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sync_type VARCHAR(50) NOT NULL CHECK (sync_type IN ('cctv', 'parking', 'shelter')),
        status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed')),

        -- Statistics
        total_count INT,
        inserted_count INT,
        updated_count INT,
        error_count INT,
        error_message TEXT,

        -- Timing
        started_at TIMESTAMP NOT NULL,
        ended_at TIMESTAMP,
        duration_ms INT,

        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await queryRunner.query(`CREATE INDEX idx_data_sync_logs_sync_type ON data_sync_logs(sync_type);`);
    await queryRunner.query(`CREATE INDEX idx_data_sync_logs_created_at ON data_sync_logs(created_at);`);

    console.log('DataSyncLog table created');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS data_sync_logs CASCADE;`);
    console.log('DataSyncLog table dropped');
  }
}
