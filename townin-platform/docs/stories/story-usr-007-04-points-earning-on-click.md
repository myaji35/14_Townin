# Story USR-007-04: Points Earning on Click

**Epic**: USR-007 Digital Flyer Viewer
**Priority**: P0 (Critical)
**Story Points**: 4
**Status**: 📋 Planned

## User Story

**As a** user
**I want to** earn points when I click flyers
**So that** I get rewarded for engagement

## Acceptance Criteria

- [ ] 전단지 클릭 시 25P 적립
- [ ] 중복 클릭 방지 (1회만)
- [ ] 포인트 적립 알림 (토스트)
- [ ] 적립 내역 기록
- [ ] 상인에게 5P 분배 (보안관 시스템 Phase 2)
- [ ] 플랫폼 수익 20P 기록

## Tasks

### Frontend
- [ ] Click handler
- [ ] Toast notification
- [ ] Loading state
- [ ] Error handling

### Backend
- [ ] POST /flyers/:id/click endpoint
- [ ] Points transaction service
- [ ] Deduplication logic (unique constraint)
- [ ] Points distribution logic
- [ ] flyer_clicks table migration

### Database
- [ ] Migration: flyer_clicks table
- [ ] Migration: points_transactions table
- [ ] Unique constraint (userId, flyerId)

### Testing
- [ ] Unit tests: Points calculation
- [ ] Integration test: Click & earn
- [ ] E2E test: Duplicate prevention

## Technical Notes

```typescript
// Frontend: Click Flyer (Extended from previous story)
class FlyerService {
  static Future<int> clickFlyer(String flyerId) async {
    final response = await dio.post('/flyers/$flyerId/click');
    return response.data['pointsEarned'];
  }
}

// Backend: Click Flyer Endpoint
@Post(':id/click')
@UseGuards(JwtAuthGuard)
async clickFlyer(@Param('id') id: string, @Req() req) {
  const userId = req.user.id;

  // Check if already clicked
  const existingClick = await this.flyerClickRepo.findOne({
    where: { userId, flyerId: id },
  });

  if (existingClick) {
    throw new BadRequestException('You have already clicked this flyer');
  }

  const flyer = await this.flyerRepo.findOne({
    where: { id },
    relations: ['merchant'],
  });

  if (!flyer) {
    throw new NotFoundException('Flyer not found');
  }

  // Check if flyer is still valid
  const now = new Date();
  if (now < flyer.validFrom || now > flyer.validTo) {
    throw new BadRequestException('Flyer is not valid');
  }

  // Execute points distribution in transaction
  await this.dataSource.transaction(async (manager) => {
    // 1. Record click
    const click = this.flyerClickRepo.create({
      userId,
      flyerId: id,
      pointsEarned: 25,
    });
    await manager.save(click);

    // 2. Increment flyer click count
    await manager.increment(Flyer, { id }, 'clickCount', 1);

    // 3. Distribute points
    await this.pointsService.distributeClickPoints(
      userId,
      flyer.merchant.userId,
      id,
      manager,
    );
  });

  return {
    message: 'Points earned successfully',
    pointsEarned: 25,
  };
}

// Points Service
@Injectable()
export class PointsService {
  async distributeClickPoints(
    userId: string,
    merchantId: string,
    flyerId: string,
    manager: EntityManager,
  ) {
    // User: 25P
    await this.addPoints(
      userId,
      25,
      'FLYER_CLICK',
      `전단지 클릭 적립`,
      flyerId,
      manager,
    );

    // Merchant: 5P (future - Security Guard)
    // await this.addPoints(merchantId, 5, 'GUARD_COMMISSION', ...);

    // Platform: 20P (revenue tracking)
    await this.addPlatformRevenue(20, 'FLYER_CLICK', flyerId, manager);
  }

  async addPoints(
    userId: string,
    amount: number,
    type: TransactionType,
    description: string,
    referenceId: string,
    manager: EntityManager,
  ) {
    // Create transaction record
    const transaction = this.transactionRepo.create({
      userId,
      amount,
      type,
      description,
      referenceId,
      status: 'completed',
    });
    await manager.save(transaction);

    // Update user balance
    const user = await manager.findOne(User, { where: { id: userId } });
    user.pointsBalance += amount;
    user.pointsEarned += amount;
    await manager.save(user);
  }

  async addPlatformRevenue(
    amount: number,
    type: string,
    referenceId: string,
    manager: EntityManager,
  ) {
    const revenue = this.revenueRepo.create({
      amount,
      type,
      referenceId,
    });
    await manager.save(revenue);
  }
}

// Database Entities
@Entity('flyer_clicks')
@Unique(['userId', 'flyerId']) // Prevent duplicates
export class FlyerClick {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  flyerId: string;

  @ManyToOne(() => Flyer)
  flyer: Flyer;

  @Column({ type: 'int', default: 25 })
  pointsEarned: number;

  @CreateDateColumn()
  clickedAt: Date;
}

@Entity('points_transactions')
export class PointsTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'int' })
  amount: number; // Can be negative for redemptions

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column()
  description: string;

  @Column({ nullable: true })
  referenceId: string; // flyerId, orderId, etc.

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export enum TransactionType {
  FLYER_CLICK = 'FLYER_CLICK',
  GUARD_COMMISSION = 'GUARD_COMMISSION',
  REFERRAL_BONUS = 'REFERRAL_BONUS',
  REDEMPTION = 'REDEMPTION',
  ADJUSTMENT = 'ADJUSTMENT',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

// User Entity (Extended)
@Entity('users')
export class User {
  // ... existing fields

  @Column({ type: 'int', default: 0 })
  pointsBalance: number;

  @Column({ type: 'int', default: 0 })
  pointsEarned: number;

  @Column({ type: 'int', default: 0 })
  pointsRedeemed: number;
}

// Platform Revenue Tracking
@Entity('platform_revenue')
export class PlatformRevenue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  amount: number;

  @Column()
  type: string; // FLYER_CLICK, SUBSCRIPTION, etc.

  @Column({ nullable: true })
  referenceId: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Migration: flyer_clicks
export class CreateFlyerClicksTable1703456789012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'flyer_clicks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'flyerId',
            type: 'uuid',
          },
          {
            name: 'pointsEarned',
            type: 'int',
            default: 25,
          },
          {
            name: 'clickedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        uniques: [
          {
            name: 'UQ_flyer_clicks_user_flyer',
            columnNames: ['userId', 'flyerId'],
          },
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['flyerId'],
            referencedTableName: 'flyers',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'flyer_clicks',
      new TableIndex({
        name: 'IDX_flyer_clicks_user',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'flyer_clicks',
      new TableIndex({
        name: 'IDX_flyer_clicks_flyer',
        columnNames: ['flyerId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('flyer_clicks');
  }
}

// Migration: points_transactions
export class CreatePointsTransactionsTable1703456789013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "points_transaction_type_enum" AS ENUM (
        'FLYER_CLICK',
        'GUARD_COMMISSION',
        'REFERRAL_BONUS',
        'REDEMPTION',
        'ADJUSTMENT'
      );

      CREATE TYPE "points_transaction_status_enum" AS ENUM (
        'PENDING',
        'COMPLETED',
        'FAILED',
        'CANCELLED'
      );
    `);

    await queryRunner.createTable(
      new Table({
        name: 'points_transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'amount',
            type: 'int',
          },
          {
            name: 'type',
            type: 'points_transaction_type_enum',
          },
          {
            name: 'description',
            type: 'varchar',
          },
          {
            name: 'referenceId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'points_transaction_status_enum',
            default: "'PENDING'",
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'points_transactions',
      new TableIndex({
        name: 'IDX_points_transactions_user',
        columnNames: ['userId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('points_transactions');
    await queryRunner.query(`
      DROP TYPE "points_transaction_type_enum";
      DROP TYPE "points_transaction_status_enum";
    `);
  }
}
```

## Dependencies

- **Depends on**: USR-007-03 (Flyer Detail)
- **Blocks**: None

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Click endpoint implemented
- [ ] Deduplication working
- [ ] Points service implemented
- [ ] Transactions recorded
- [ ] User balance updated
- [ ] Toast notification working
- [ ] Migrations run
- [ ] Tests passing
- [ ] Code reviewed and merged

## Notes

- 포인트 분배: User 25P, Guard 5P (Phase 2), Platform 20P
- Unique constraint로 중복 방지
- Transaction을 사용하여 원자성 보장
- 유효 기간 만료된 전단지는 클릭 불가
- 포인트 내역은 points_transactions에 기록
- User 엔티티에 pointsBalance 필드 추가
- Phase 2에서 보안관 분배 구현
- 플랫폼 수익은 platform_revenue 테이블에 기록
