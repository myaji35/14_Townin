import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnablePostGIS1701356400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable PostGIS extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);

    // Enable PostGIS topology extension (optional, for advanced use)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis_topology;`);

    // Verify PostGIS version
    await queryRunner.query(`SELECT PostGIS_Version();`);

    console.log('PostGIS extension enabled successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop PostGIS extensions
    await queryRunner.query(`DROP EXTENSION IF EXISTS postgis_topology CASCADE;`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS postgis CASCADE;`);

    console.log('PostGIS extension disabled');
  }
}
