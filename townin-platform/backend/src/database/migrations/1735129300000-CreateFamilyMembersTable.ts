import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFamilyMembersTable1735129300000
  implements MigrationInterface
{
  name = 'CreateFamilyMembersTable1735129300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create family_relationship enum type
    await queryRunner.query(
      `CREATE TYPE "family_relationship" AS ENUM(
        'parent',
        'child',
        'spouse',
        'sibling',
        'grandparent',
        'grandchild',
        'other'
      )`,
    );

    // Create family_members table
    await queryRunner.query(
      `CREATE TABLE "family_members" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "family_member_id" VARCHAR(255) UNIQUE NOT NULL,
        "relationship" family_relationship NOT NULL,
        "birth_year" INTEGER,
        "gender" VARCHAR(10),
        "nickname" VARCHAR(50),
        "has_iot_sensors" BOOLEAN DEFAULT false,
        "notifications_enabled" BOOLEAN DEFAULT true,
        "is_active" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
    );

    // Create indexes for performance
    await queryRunner.query(
      `CREATE INDEX "idx_family_members_user_id" ON "family_members" ("user_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_family_members_family_member_id" ON "family_members" ("family_member_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_family_members_relationship" ON "family_members" ("relationship")`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_family_members_user_active" ON "family_members" ("user_id", "is_active")`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_family_members_iot_sensors" ON "family_members" ("user_id", "has_iot_sensors") WHERE "has_iot_sensors" = true AND "is_active" = true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_family_members_iot_sensors"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_family_members_user_active"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_family_members_relationship"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_family_members_family_member_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_family_members_user_id"`,
    );

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS "family_members"`);

    // Drop enum type
    await queryRunner.query(`DROP TYPE IF EXISTS "family_relationship"`);
  }
}
