import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { databaseConfig } from '../src/config/database.config';

/**
 * Test Data Seeding Script
 *
 * Creates test users, merchants, and flyers for MVP testing
 */

async function seedTestData() {
  console.log('🌱 Starting test data seeding...\n');

  const dataSource = new DataSource(databaseConfig as any);
  await dataSource.initialize();

  try {
    // 1. Create test users
    console.log('1️⃣ Creating test users...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Admin user
    await dataSource.query(`
      INSERT INTO users (id, email, password_hash, role, age_range, household_type, is_active, created_at, updated_at)
      VALUES
        ('admin-test-uuid-001', 'admin@townin.kr', $1, 'admin', '30s', 'single', true, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);
    console.log('   ✅ Admin user created: admin@townin.kr / password123');

    // Regular user
    await dataSource.query(`
      INSERT INTO users (id, email, password_hash, role, age_range, household_type, is_active, created_at, updated_at)
      VALUES
        ('user-test-uuid-001', 'user@townin.kr', $1, 'user', '20s', 'single', true, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);
    console.log('   ✅ Regular user created: user@townin.kr / password123');

    // 2. Create test merchants
    console.log('\n2️⃣ Creating test merchants...');

    await dataSource.query(`
      INSERT INTO merchants (
        id, user_id, business_name, business_number, phone_number,
        address, grid_cell, is_active, created_at, updated_at
      )
      VALUES
        (
          'merchant-test-uuid-001',
          'admin-test-uuid-001',
          '타운마트',
          '123-45-67890',
          '02-1234-5678',
          '서울시 강남구 테헤란로 123',
          '8a2a1005892ffff',
          true,
          NOW(),
          NOW()
        ),
        (
          'merchant-test-uuid-002',
          'admin-test-uuid-001',
          '행복한 카페',
          '234-56-78901',
          '02-2345-6789',
          '서울시 강남구 역삼동 456',
          '8a2a1005893ffff',
          true,
          NOW(),
          NOW()
        ),
        (
          'merchant-test-uuid-003',
          'admin-test-uuid-001',
          '패션 하우스',
          '345-67-89012',
          '02-3456-7890',
          '서울시 강남구 선릉로 789',
          '8a2a1005894ffff',
          true,
          NOW(),
          NOW()
        )
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('   ✅ 3 merchants created');

    // 3. Create test flyers
    console.log('\n3️⃣ Creating test flyers...');

    await dataSource.query(`
      INSERT INTO flyers (
        id, merchant_id, title, description, image_url,
        category, status, target_radius, start_date, expires_at,
        view_count, click_count, is_active, created_at, updated_at
      )
      VALUES
        (
          'flyer-test-uuid-001',
          'merchant-test-uuid-001',
          '신선한 과일 대폭 할인!',
          '모든 과일 20% 할인! 오늘만 특가!',
          'https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Fresh+Fruits',
          'food',
          'approved',
          1000,
          NOW(),
          NOW() + INTERVAL '30 days',
          120,
          45,
          true,
          NOW(),
          NOW()
        ),
        (
          'flyer-test-uuid-002',
          'merchant-test-uuid-002',
          '아메리카노 1+1 이벤트',
          '아메리카노 구매 시 1잔 무료! 오후 3시~5시',
          'https://via.placeholder.com/800x600/4ECDC4/FFFFFF?text=Coffee+Event',
          'food',
          'approved',
          1500,
          NOW(),
          NOW() + INTERVAL '14 days',
          89,
          32,
          true,
          NOW(),
          NOW()
        ),
        (
          'flyer-test-uuid-003',
          'merchant-test-uuid-003',
          '봄맞이 신상품 입고',
          '2025 봄 신상 의류 전품목 30% 할인',
          'https://via.placeholder.com/800x600/95E1D3/FFFFFF?text=Spring+Fashion',
          'fashion',
          'approved',
          2000,
          NOW(),
          NOW() + INTERVAL '60 days',
          156,
          78,
          true,
          NOW(),
          NOW()
        ),
        (
          'flyer-test-uuid-004',
          'merchant-test-uuid-001',
          '월요일 특가 세일',
          '매주 월요일 전품목 10% 추가 할인',
          'https://via.placeholder.com/800x600/F38181/FFFFFF?text=Monday+Sale',
          'food',
          'pending_approval',
          1000,
          NOW(),
          NOW() + INTERVAL '90 days',
          0,
          0,
          true,
          NOW(),
          NOW()
        ),
        (
          'flyer-test-uuid-005',
          'merchant-test-uuid-002',
          '디저트 세트 할인',
          '케이크 + 음료 세트 특가',
          'https://via.placeholder.com/800x600/AA96DA/FFFFFF?text=Dessert+Set',
          'food',
          'draft',
          1500,
          NULL,
          NULL,
          0,
          0,
          true,
          NOW(),
          NOW()
        )
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('   ✅ 5 flyers created');
    console.log('      - 3 approved (visible to users)');
    console.log('      - 1 pending approval');
    console.log('      - 1 draft');

    // 4. Summary
    console.log('\n📊 Test Data Summary:');
    console.log('   👤 Users:');
    console.log('      - admin@townin.kr (Admin)');
    console.log('      - user@townin.kr (Regular User)');
    console.log('   🏪 Merchants: 3');
    console.log('   📄 Flyers: 5 (3 approved, 1 pending, 1 draft)');
    console.log('\n✅ Test data seeding complete!\n');

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

// Run seeding
seedTestData()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed:', error);
    process.exit(1);
  });
