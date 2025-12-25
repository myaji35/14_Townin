import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnablePostGIS1701000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable PostGIS extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis_topology;`);

    // Verify PostGIS version
    await queryRunner.query(`SELECT PostGIS_Version();`);

    console.log('PostGIS extension enabled successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP EXTENSION IF EXISTS postgis_topology;`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS postgis;`);
  }
}
