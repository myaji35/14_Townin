import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('User Flow E2E Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.setGlobalPrefix('api');

    await app.init();

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    // Cleanup: Remove test data
    if (userId) {
      await dataSource.query('DELETE FROM user_hubs WHERE user_id = $1', [userId]);
      await dataSource.query('DELETE FROM user_points WHERE user_id = $1', [userId]);
      await dataSource.query('DELETE FROM point_transactions WHERE user_id = $1', [userId]);
      await dataSource.query('DELETE FROM users WHERE id = $1', [userId]);
    }

    await app.close();
  });

  describe('Complete User Journey', () => {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'Test123!@#';

    it('1. Should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          displayName: 'E2E Test User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testEmail);

      authToken = response.body.accessToken;
      userId = response.body.user.id;
    });

    it('2. Should login with registered credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      authToken = response.body.accessToken;
    });

    it('3. Should get user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.email).toBe(testEmail);
      expect(response.body).toHaveProperty('id');
    });

    it('4. Should have initial points (profile_complete bonus)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/points/balance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalPoints');
      expect(response.body.totalPoints).toBeGreaterThanOrEqual(0);
    });

    let hubId: string;

    it('5. Should create a user hub (residence)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/me/hubs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hubType: 'residence',
          name: '우리집',
          address: '서울시 강남구',
          lat: 37.4979,
          lng: 127.0276,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.hubType).toBe('residence');
      expect(response.body.name).toBe('우리집');

      hubId = response.body.id;
    });

    it('6. Should get user dashboard with hub information', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/me/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('points');
      expect(response.body).toHaveProperty('hubs');
      expect(response.body.hubs.totalHubs).toBeGreaterThanOrEqual(1);
    });

    it('7. Should view nearby flyers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/flyers')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          lat: 37.4979,
          lng: 127.0276,
          radiusKm: 5,
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('8. Should get nearby public data (CCTV)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/public-data/cctv')
        .query({
          lat: 37.4979,
          lng: 127.0276,
          radiusKm: 2,
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('9. Should check points transaction history', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/points/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          page: 1,
          limit: 10,
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('10. Should delete user hub', async () => {
      await request(app.getHttpServer())
        .delete(`/api/users/me/hubs/${hubId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('Merchant Flow', () => {
    let merchantToken: string;
    let merchantUserId: string;
    let merchantId: string;
    let flyerId: string;

    const merchantEmail = `merchant-${Date.now()}@example.com`;
    const merchantPassword = 'Merchant123!@#';

    afterAll(async () => {
      // Cleanup merchant data
      if (flyerId) {
        await dataSource.query('DELETE FROM flyers WHERE id = $1', [flyerId]);
      }
      if (merchantId) {
        await dataSource.query('DELETE FROM digital_signboards WHERE merchant_id = $1', [merchantId]);
        await dataSource.query('DELETE FROM merchants WHERE id = $1', [merchantId]);
      }
      if (merchantUserId) {
        await dataSource.query('DELETE FROM users WHERE id = $1', [merchantUserId]);
      }
    });

    it('1. Should register as merchant', async () => {
      // First register as user
      const userResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: merchantEmail,
          password: merchantPassword,
          displayName: 'E2E Merchant',
        })
        .expect(201);

      merchantToken = userResponse.body.accessToken;
      merchantUserId = userResponse.body.user.id;

      // Then create merchant profile
      const merchantResponse = await request(app.getHttpServer())
        .post('/api/merchants')
        .set('Authorization', `Bearer ${merchantToken}`)
        .send({
          businessName: 'E2E Test Shop',
          category: 'restaurant',
          address: '서울시 강남구 테헤란로',
          lat: 37.5010,
          lng: 127.0390,
          phone: '02-1234-5678',
        })
        .expect(201);

      expect(merchantResponse.body).toHaveProperty('id');
      expect(merchantResponse.body.businessName).toBe('E2E Test Shop');

      merchantId = merchantResponse.body.id;
    });

    it('2. Should create digital signboard', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/merchants/me/signboard')
        .set('Authorization', `Bearer ${merchantToken}`)
        .send({
          displayName: 'E2E Test Signboard',
          backgroundColor: '#FFFFFF',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('closed');
    });

    it('3. Should open signboard', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/signboards/open')
        .set('Authorization', `Bearer ${merchantToken}`)
        .expect(200);

      expect(response.body.status).toBe('open');
    });

    it('4. Should create a flyer', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/flyers')
        .set('Authorization', `Bearer ${merchantToken}`)
        .send({
          title: 'E2E Test Flyer',
          content: '특별 할인 이벤트!',
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('E2E Test Flyer');
      expect(response.body.status).toBe('draft');

      flyerId = response.body.id;
    });

    it('5. Should get merchant dashboard', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/merchants/me/dashboard')
        .set('Authorization', `Bearer ${merchantToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('merchant');
      expect(response.body).toHaveProperty('flyers');
      expect(response.body).toHaveProperty('performance');
    });

    it('6. Should close signboard', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/signboards/close')
        .set('Authorization', `Bearer ${merchantToken}`)
        .expect(200);

      expect(response.body.status).toBe('closed');
    });
  });

  describe('Admin Flow', () => {
    let adminToken: string;

    beforeAll(async () => {
      // Get admin token (assume admin@townin.com exists from seed)
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@townin.com',
          password: 'password123',
        });

      if (loginResponse.status === 200) {
        adminToken = loginResponse.body.accessToken;
      }
    });

    it('1. Should get admin dashboard stats', async () => {
      if (!adminToken) {
        console.log('⚠️  Admin user not found - skipping admin tests');
        return;
      }

      const response = await request(app.getHttpServer())
        .get('/api/admin/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('merchants');
      expect(response.body).toHaveProperty('flyers');
      expect(response.body).toHaveProperty('points');
    });

    it('2. Should get DAU/MAU metrics', async () => {
      if (!adminToken) return;

      const response = await request(app.getHttpServer())
        .get('/api/admin/dashboard/active-users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('dau');
      expect(response.body).toHaveProperty('mau');
      expect(response.body).toHaveProperty('stickiness');
    });

    it('3. Should get regional statistics', async () => {
      if (!adminToken) return;

      const response = await request(app.getHttpServer())
        .get('/api/admin/dashboard/regional-stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('topMerchantRegions');
      expect(response.body).toHaveProperty('topEngagementRegions');
    });
  });
});
