import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1733040000000 implements MigrationInterface {
  name = 'InitialSchema1733040000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable required PostgreSQL extensions
    await queryRunner.query(
      `CREATE EXTENSION IF NOT EXISTS postgis;`,
    );
    await queryRunner.query(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
    );

    // Create ENUM types
    await queryRunner.query(
      `CREATE TYPE "user_role" AS ENUM('user', 'merchant', 'admin');`,
    );
    await queryRunner.query(
      `CREATE TYPE "user_hub_type" AS ENUM('residence', 'workplace', 'family_home');`,
    );
    await queryRunner.query(
      `CREATE TYPE "flyer_status" AS ENUM('draft', 'pending', 'approved', 'rejected', 'expired');`,
    );
    await queryRunner.query(
      `CREATE TYPE "point_transaction_type" AS ENUM('earned', 'spent', 'expired', 'refunded');`,
    );
    await queryRunner.query(
      `CREATE TYPE "point_earn_reason" AS ENUM('profile_complete', 'hub_create', 'flyer_view', 'flyer_click', 'daily_checkin', 'referral', 'admin_grant', 'other');`,
    );
    await queryRunner.query(
      `CREATE TYPE "point_spend_reason" AS ENUM('flyer_target_area', 'premium_feature', 'admin_deduct', 'other');`,
    );
    await queryRunner.query(
      `CREATE TYPE "signboard_status" AS ENUM('closed', 'open', 'suspended');`,
    );
    await queryRunner.query(
      `CREATE TYPE "notification_channel" AS ENUM('push', 'websocket', 'email');`,
    );

    // Users table
    await queryRunner.query(
      `CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "password_hash" VARCHAR(255),
        "display_name" VARCHAR(100),
        "phone" VARCHAR(20),
        "role" user_role DEFAULT 'user',
        "is_active" BOOLEAN DEFAULT true,
        "is_verified" BOOLEAN DEFAULT false,
        "oauth_provider" VARCHAR(50),
        "oauth_id" VARCHAR(255),
        "profile_picture_url" VARCHAR(500),
        "last_login_at" TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP
      );`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_email" ON "users" ("email");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_oauth" ON "users" ("oauth_provider", "oauth_id");`,
    );

    // User Hubs table
    await queryRunner.query(
      `CREATE TABLE "user_hubs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "hub_type" user_hub_type NOT NULL,
        "name" VARCHAR(100),
        "address" VARCHAR(500),
        "location" GEOGRAPHY(Point, 4326),
        "h3_cell_id" VARCHAR(20),
        "is_primary" BOOLEAN DEFAULT false,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_hubs_user_id" ON "user_hubs" ("user_id");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_hubs_location" ON "user_hubs" USING GIST ("location");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_hubs_h3_cell" ON "user_hubs" ("h3_cell_id");`,
    );

    // Merchants table
    await queryRunner.query(
      `CREATE TABLE "merchants" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "business_name" VARCHAR(255) NOT NULL,
        "business_number" VARCHAR(50),
        "category" VARCHAR(100),
        "address" VARCHAR(500),
        "address_detail" VARCHAR(200),
        "location" GEOGRAPHY(Point, 4326),
        "grid_cell" VARCHAR(20),
        "phone" VARCHAR(20),
        "description" TEXT,
        "logo_url" VARCHAR(500),
        "website" VARCHAR(500),
        "signboard_status" signboard_status DEFAULT 'closed',
        "is_verified" BOOLEAN DEFAULT false,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_merchants_user_id" ON "merchants" ("user_id");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_merchants_location" ON "merchants" USING GIST ("location");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_merchants_grid_cell" ON "merchants" ("grid_cell");`,
    );

    // Digital Signboards table
    await queryRunner.query(
      `CREATE TABLE "digital_signboards" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "merchant_id" uuid UNIQUE NOT NULL REFERENCES "merchants"("id") ON DELETE CASCADE,
        "display_name" VARCHAR(200) NOT NULL,
        "status" signboard_status DEFAULT 'closed',
        "background_color" VARCHAR(10) DEFAULT '#FFFFFF',
        "total_views" INTEGER DEFAULT 0,
        "total_clicks" INTEGER DEFAULT 0,
        "opened_at" TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_digital_signboards_merchant" ON "digital_signboards" ("merchant_id");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_digital_signboards_status" ON "digital_signboards" ("status");`,
    );

    // Flyers table
    await queryRunner.query(
      `CREATE TABLE "flyers" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "merchant_id" uuid NOT NULL REFERENCES "merchants"("id") ON DELETE CASCADE,
        "title" VARCHAR(255) NOT NULL,
        "content" TEXT,
        "thumbnail_url" VARCHAR(500),
        "image_urls" TEXT[],
        "status" flyer_status DEFAULT 'draft',
        "view_count" INTEGER DEFAULT 0,
        "click_count" INTEGER DEFAULT 0,
        "share_count" INTEGER DEFAULT 0,
        "starts_at" TIMESTAMP,
        "ends_at" TIMESTAMP,
        "is_active" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP
      );`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_flyers_merchant" ON "flyers" ("merchant_id");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_flyers_status" ON "flyers" ("status");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_flyers_active" ON "flyers" ("is_active", "starts_at", "ends_at");`,
    );

    // Flyer Likes table
    await queryRunner.query(
      `CREATE TABLE "flyer_likes" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "flyer_id" uuid NOT NULL REFERENCES "flyers"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE ("user_id", "flyer_id")
      );`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_flyer_likes_user" ON "flyer_likes" ("user_id");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_flyer_likes_flyer" ON "flyer_likes" ("flyer_id");`,
    );

    // Flyer Bookmarks table
    await queryRunner.query(
      `CREATE TABLE "flyer_bookmarks" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "flyer_id" uuid NOT NULL REFERENCES "flyers"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE ("user_id", "flyer_id")
      );`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_flyer_bookmarks_user" ON "flyer_bookmarks" ("user_id");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_flyer_bookmarks_flyer" ON "flyer_bookmarks" ("flyer_id");`,
    );

    // Flyer Target Areas table
    await queryRunner.query(
      `CREATE TABLE "flyer_target_areas" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "flyer_id" uuid NOT NULL REFERENCES "flyers"("id") ON DELETE CASCADE,
        "h3_cell_id" VARCHAR(20) NOT NULL,
        "h3_resolution" INTEGER DEFAULT 9,
        "estimated_reach" INTEGER DEFAULT 0,
        "cost_per_cell" DECIMAL(10, 2) NOT NULL,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_flyer_target_areas_flyer" ON "flyer_target_areas" ("flyer_id");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_flyer_target_areas_h3" ON "flyer_target_areas" ("h3_cell_id");`,
    );

    // User Points table
    await queryRunner.query(
      `CREATE TABLE "user_points" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "total_points" INTEGER DEFAULT 0,
        "lifetime_earned" INTEGER DEFAULT 0,
        "lifetime_spent" INTEGER DEFAULT 0,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_points_user" ON "user_points" ("user_id");`,
    );

    // Point Transactions table
    await queryRunner.query(
      `CREATE TABLE "point_transactions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "type" point_transaction_type NOT NULL,
        "amount" INTEGER NOT NULL,
        "balance_after" INTEGER NOT NULL,
        "reason" VARCHAR(255),
        "earn_reason" point_earn_reason,
        "spend_reason" point_spend_reason,
        "reference_type" VARCHAR(50),
        "reference_id" VARCHAR(255),
        "expires_at" TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_point_transactions_user" ON "point_transactions" ("user_id", "created_at");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_point_transactions_type" ON "point_transactions" ("type");`,
    );

    // CCTV Cameras table
    await queryRunner.query(
      `CREATE TABLE "cctv_cameras" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "external_id" VARCHAR(100) UNIQUE,
        "name" VARCHAR(255),
        "address" VARCHAR(500),
        "location" GEOGRAPHY(Point, 4326) NOT NULL,
        "camera_type" VARCHAR(50),
        "installation_year" INTEGER,
        "managing_org" VARCHAR(200),
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_cctv_location" ON "cctv_cameras" USING GIST ("location");`,
    );

    // Parking Lots table
    await queryRunner.query(
      `CREATE TABLE "parking_lots" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "external_id" VARCHAR(100) UNIQUE,
        "name" VARCHAR(255) NOT NULL,
        "address" VARCHAR(500),
        "location" GEOGRAPHY(Point, 4326) NOT NULL,
        "parking_type" VARCHAR(50),
        "total_spaces" INTEGER,
        "available_spaces" INTEGER,
        "operating_hours" VARCHAR(200),
        "fee_info" TEXT,
        "last_updated_at" TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_parking_location" ON "parking_lots" USING GIST ("location");`,
    );

    // Shelters table
    await queryRunner.query(
      `CREATE TABLE "shelters" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "external_id" VARCHAR(100) UNIQUE,
        "name" VARCHAR(255) NOT NULL,
        "address" VARCHAR(500),
        "location" GEOGRAPHY(Point, 4326) NOT NULL,
        "shelter_type" VARCHAR(50),
        "capacity" INTEGER,
        "area_sqm" DECIMAL(10, 2),
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_shelters_location" ON "shelters" USING GIST ("location");`,
    );

    // Notification Preferences table
    await queryRunner.query(
      `CREATE TABLE "notification_preferences" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "push_enabled" BOOLEAN DEFAULT true,
        "email_enabled" BOOLEAN DEFAULT false,
        "flyer_notifications" BOOLEAN DEFAULT true,
        "point_notifications" BOOLEAN DEFAULT true,
        "system_notifications" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
    );

    // Device Tokens table
    await queryRunner.query(
      `CREATE TABLE "device_tokens" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "token" VARCHAR(500) NOT NULL,
        "device_type" VARCHAR(20),
        "device_id" VARCHAR(255),
        "is_active" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_device_tokens_user" ON "device_tokens" ("user_id");`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_device_tokens_token" ON "device_tokens" ("token");`,
    );

    // Analytics Events table
    await queryRunner.query(
      `CREATE TABLE "analytics_events" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "event_name" VARCHAR(100) NOT NULL,
        "event_category" VARCHAR(50),
        "properties" JSONB,
        "session_id" VARCHAR(255),
        "ip_address" VARCHAR(45),
        "user_agent" TEXT,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_analytics_events_name" ON "analytics_events" ("event_name", "created_at");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_analytics_events_user" ON "analytics_events" ("user_id", "created_at");`,
    );

    // Files table
    await queryRunner.query(
      `CREATE TABLE "files" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "original_name" VARCHAR(500) NOT NULL,
        "file_name" VARCHAR(500) NOT NULL,
        "mime_type" VARCHAR(100),
        "size_bytes" BIGINT,
        "s3_key" VARCHAR(500),
        "s3_bucket" VARCHAR(200),
        "url" VARCHAR(1000),
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_files_user" ON "files" ("user_id");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS "files" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "analytics_events" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "device_tokens" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notification_preferences" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "shelters" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "parking_lots" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cctv_cameras" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "point_transactions" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_points" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "flyer_target_areas" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "flyer_bookmarks" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "flyer_likes" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "flyers" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "digital_signboards" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "merchants" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_hubs" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE;`);

    // Drop ENUM types
    await queryRunner.query(`DROP TYPE IF EXISTS "notification_channel";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "signboard_status";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "point_spend_reason";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "point_earn_reason";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "point_transaction_type";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "flyer_status";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_hub_type";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role";`);
  }
}
