import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Flyer Management E2E Tests', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let authToken: string;
    let merchantToken: string;
    let guardToken: string;
    let createdFlyerId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

        await app.init();

        dataSource = moduleFixture.get<DataSource>(DataSource);
    });

    afterAll(async () => {
        await dataSource.destroy();
        await app.close();
    });

    describe('Authentication', () => {
        it('/auth/register (POST) - Create merchant account', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    email: 'merchant@test.com',
                    password: 'Test1234!',
                    name: '테스트 머천트',
                    phoneNumber: '010-1234-5678',
                    role: 'merchant',
                })
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body.email).toBe('merchant@test.com');
        });

        it('/auth/login (POST) - Merchant login', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: 'merchant@test.com',
                    password: 'Test1234!',
                })
                .expect(200);

            expect(response.body).toHaveProperty('access_token');
            merchantToken = response.body.access_token;
        });

        it('/auth/register (POST) - Create guard account', async () => {
            await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    email: 'guard@test.com',
                    password: 'Test1234!',
                    name: '테스트 가드',
                    phoneNumber: '010-9876-5432',
                    role: 'security_guard',
                })
                .expect(201);
        });

        it('/auth/login (POST) - Guard login', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: 'guard@test.com',
                    password: 'Test1234!',
                })
                .expect(200);

            guardToken = response.body.access_token;
        });
    });

    describe('Flyer CRUD Operations', () => {
        it('/flyers (POST) - Create new flyer', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/flyers')
                .set('Authorization', `Bearer ${merchantToken}`)
                .send({
                    title: '유기농 채소 30% 할인',
                    description: '건강 목표에 맞춘 특별 할인! 매일매일 신선한 유기농 채소를 만나보세요.',
                    category: 'food',
                    discount: '30% OFF',
                    location: '의정부동',
                    latitude: 37.7414,
                    longitude: 127.0471,
                    validFrom: '2026-01-04',
                    validUntil: '2026-12-31',
                    points: 25,
                })
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body.title).toBe('유기농 채소 30% 할인');
            expect(response.body.status).toBe('pending');
            createdFlyerId = response.body.id;
        });

        it('/flyers (GET) - Get all flyers', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/flyers')
                .expect(200);

            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('meta');
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('/flyers/:id (GET) - Get single flyer', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/flyers/${createdFlyerId}`)
                .expect(200);

            expect(response.body.id).toBe(createdFlyerId);
            expect(response.body.title).toBe('유기농 채소 30% 할인');
        });

        it('/flyers/:id (PATCH) - Update flyer', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/api/v1/flyers/${createdFlyerId}`)
                .set('Authorization', `Bearer ${merchantToken}`)
                .send({
                    discount: '40% OFF',
                })
                .expect(200);

            expect(response.body.discount).toBe('40% OFF');
        });

        it('/flyers?status=pending (GET) - Get pending flyers', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/flyers?status=pending')
                .set('Authorization', `Bearer ${guardToken}`)
                .expect(200);

            expect(response.body.data.length).toBeGreaterThan(0);
            expect(response.body.data[0].status).toBe('pending');
        });
    });

    describe('Flyer Approval Workflow', () => {
        it('/flyers/:id/approve (POST) - Approve flyer', async () => {
            const response = await request(app.getHttpServer())
                .post(`/api/v1/flyers/${createdFlyerId}/approve`)
                .set('Authorization', `Bearer ${guardToken}`)
                .send({
                    reason: '검토 완료. 모든 기준 충족.',
                })
                .expect(200);

            expect(response.body.status).toBe('approved');
        });

        it('/flyers/:id (GET) - Verify approved status', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/flyers/${createdFlyerId}`)
                .expect(200);

            expect(response.body.status).toBe('approved');
        });
    });

    describe('Analytics', () => {
        it('/analytics/flyers/:id (GET) - Get flyer analytics', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/analytics/flyers/${createdFlyerId}`)
                .set('Authorization', `Bearer ${merchantToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('views');
            expect(response.body).toHaveProperty('clicks');
            expect(response.body).toHaveProperty('conversion');
        });

        it('/analytics/merchants/:id (GET) - Get merchant analytics', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/analytics/merchants/me')
                .set('Authorization', `Bearer ${merchantToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('totalFlyers');
            expect(response.body).toHaveProperty('totalViews');
            expect(response.body).toHaveProperty('avgConversion');
        });
    });

    describe('Cleanup', () => {
        it('/flyers/:id (DELETE) - Delete flyer', async () => {
            await request(app.getHttpServer())
                .delete(`/api/v1/flyers/${createdFlyerId}`)
                .set('Authorization', `Bearer ${merchantToken}`)
                .expect(200);
        });

        it('/flyers/:id (GET) - Verify deletion', async () => {
            await request(app.getHttpServer())
                .get(`/api/v1/flyers/${createdFlyerId}`)
                .expect(404);
        });
    });
});
