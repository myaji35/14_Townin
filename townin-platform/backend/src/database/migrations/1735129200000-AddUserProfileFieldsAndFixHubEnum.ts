import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserProfileFieldsAndFixHubEnum1735129200000
  implements MigrationInterface
{
  name = 'AddUserProfileFieldsAndFixHubEnum1735129200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add birth_year column to users table
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "birth_year" INTEGER`,
    );

    // Add gender column to users table
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "gender" VARCHAR(10)`,
    );

    // Fix Hub Type Enum - Update existing values first
    await queryRunner.query(
      `UPDATE "user_hubs" SET "hub_type" = 'home' WHERE "hub_type" = 'residence'`,
    );
    await queryRunner.query(
      `UPDATE "user_hubs" SET "hub_type" = 'work' WHERE "hub_type" = 'workplace'`,
    );
    await queryRunner.query(
      `UPDATE "user_hubs" SET "hub_type" = 'family' WHERE "hub_type" = 'family_home'`,
    );

    // Drop old enum type and create new one
    await queryRunner.query(
      `ALTER TABLE "user_hubs" ALTER COLUMN "hub_type" TYPE VARCHAR(50)`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "user_hub_type"`);
    await queryRunner.query(
      `CREATE TYPE "user_hub_type" AS ENUM('home', 'work', 'family')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_hubs" ALTER COLUMN "hub_type" TYPE "user_hub_type" USING "hub_type"::"user_hub_type"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert hub_type enum changes
    await queryRunner.query(
      `ALTER TABLE "user_hubs" ALTER COLUMN "hub_type" TYPE VARCHAR(50)`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "user_hub_type"`);
    await queryRunner.query(
      `CREATE TYPE "user_hub_type" AS ENUM('residence', 'workplace', 'family_home')`,
    );

    await queryRunner.query(
      `UPDATE "user_hubs" SET "hub_type" = 'residence' WHERE "hub_type" = 'home'`,
    );
    await queryRunner.query(
      `UPDATE "user_hubs" SET "hub_type" = 'workplace' WHERE "hub_type" = 'work'`,
    );
    await queryRunner.query(
      `UPDATE "user_hubs" SET "hub_type" = 'family_home' WHERE "hub_type" = 'family'`,
    );

    await queryRunner.query(
      `ALTER TABLE "user_hubs" ALTER COLUMN "hub_type" TYPE "user_hub_type" USING "hub_type"::"user_hub_type"`,
    );

    // Remove gender column
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "gender"`);

    // Remove birth_year column
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "birth_year"`);
  }
}
