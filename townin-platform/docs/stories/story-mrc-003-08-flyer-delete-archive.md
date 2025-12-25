# Story MRC-003-08: Flyer Delete & Archive

**Epic**: MRC-003 Basic Flyer Creation
**Priority**: P0 (Critical)
**Story Points**: 2
**Status**: 📋 Planned

## User Story

**As a** merchant
**I want to** delete or deactivate flyers
**So that** I can remove outdated offers

## Acceptance Criteria

- [ ] 삭제 버튼 (소프트 삭제)
- [ ] 삭제 확인 다이얼로그
- [ ] 활성/비활성 토글
- [ ] 삭제된 전단지 복원 (30일 이내)
- [ ] 완전 삭제 (30일 후 자동)

## Tasks

### Frontend
- [ ] Delete confirmation dialog
- [ ] Toggle active status button
- [ ] Restore deleted flyer (optional)

### Backend
- [ ] DELETE /flyers/:id (soft delete)
- [ ] PATCH /flyers/:id/toggle-active
- [ ] POST /flyers/:id/restore
- [ ] Cron job: permanent deletion after 30 days

### Testing
- [ ] Integration test: Soft delete
- [ ] Integration test: Toggle active
- [ ] E2E test: Delete & restore

## Technical Notes

```typescript
// Flyer Service (Extended)
class FlyerService {
  static Future<void> deleteFlyer(String flyerId) async {
    await dio.delete('/flyers/$flyerId');
  }

  static Future<void> toggleActive(String flyerId) async {
    await dio.patch('/flyers/$flyerId/toggle-active');
  }

  static Future<void> restoreFlyer(String flyerId) async {
    await dio.post('/flyers/$flyerId/restore');
  }
}

// Backend: Soft Delete Flyer
@Delete(':id')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.MERCHANT)
async deleteFlyer(@Param('id') id: string, @Req() req) {
  const flyer = await this.flyerRepo.findOne({
    where: { id, merchantId: req.user.id, isDeleted: false },
  });

  if (!flyer) {
    throw new NotFoundException('Flyer not found or already deleted');
  }

  flyer.isDeleted = true;
  flyer.deletedAt = new Date();
  flyer.isActive = false;

  await this.flyerRepo.save(flyer);

  return { message: 'Flyer deleted successfully' };
}

// Backend: Toggle Active Status
@Patch(':id/toggle-active')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.MERCHANT)
async toggleActive(@Param('id') id: string, @Req() req) {
  const flyer = await this.flyerRepo.findOne({
    where: { id, merchantId: req.user.id, isDeleted: false },
  });

  if (!flyer) {
    throw new NotFoundException('Flyer not found');
  }

  flyer.isActive = !flyer.isActive;

  await this.flyerRepo.save(flyer);

  return {
    message: `Flyer ${flyer.isActive ? 'activated' : 'deactivated'}`,
    isActive: flyer.isActive,
  };
}

// Backend: Restore Deleted Flyer
@Post(':id/restore')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.MERCHANT)
async restoreFlyer(@Param('id') id: string, @Req() req) {
  const flyer = await this.flyerRepo.findOne({
    where: { id, merchantId: req.user.id, isDeleted: true },
  });

  if (!flyer) {
    throw new NotFoundException('Deleted flyer not found');
  }

  // Check if within 30 days
  const daysSinceDeleted = Math.floor(
    (Date.now() - flyer.deletedAt.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysSinceDeleted > 30) {
    throw new BadRequestException('Flyer can only be restored within 30 days of deletion');
  }

  flyer.isDeleted = false;
  flyer.deletedAt = null;
  flyer.isActive = true;

  await this.flyerRepo.save(flyer);

  return { message: 'Flyer restored successfully' };
}

// Backend: Cron Job - Permanent Delete
@Injectable()
export class FlyerScheduler {
  @Cron('0 2 * * *') // Daily at 2 AM
  async permanentlyDeleteOldFlyers() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.flyerRepo.delete({
      isDeleted: true,
      deletedAt: LessThan(thirtyDaysAgo),
    });

    this.logger.log(`Permanently deleted ${result.affected} flyers`);
  }

  @Cron('0 * * * *') // Every hour
  async deactivateExpiredFlyers() {
    const now = new Date();

    await this.flyerRepo.update(
      {
        expiresAt: LessThan(now),
        isActive: true,
        isDeleted: false,
      },
      {
        isActive: false,
      },
    );

    this.logger.log('Deactivated expired flyers');
  }
}

// Migration: Add Delete Fields
export class AddFlyerDeleteFields1703456789020 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'flyers',
      new TableColumn({
        name: 'isDeleted',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'flyers',
      new TableColumn({
        name: 'deletedAt',
        type: 'timestamp',
        isNullable: true,
      }),
    );

    await queryRunner.createIndex(
      'flyers',
      new TableIndex({
        name: 'IDX_flyers_deleted',
        columnNames: ['isDeleted', 'deletedAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('flyers', 'IDX_flyers_deleted');
    await queryRunner.dropColumn('flyers', 'deletedAt');
    await queryRunner.dropColumn('flyers', 'isDeleted');
  }
}
```

## Dependencies

- **Depends on**: MRC-003-07
- **Blocks**: None (Epic complete!)

## Definition of Done

- [ ] Soft delete working
- [ ] Toggle active working
- [ ] Restore working (30 days)
- [ ] Cron job for permanent deletion working
- [ ] Cron job for auto-deactivation working
- [ ] Migration run
- [ ] Tests passing

## Notes

- 소프트 삭제: isDeleted = true, isActive = false
- 30일 이내 복원 가능
- 30일 후 자동 완전 삭제 (Cron)
- 만료된 전단지 자동 비활성화 (매시간)
- isDeleted = true인 전단지는 사용자에게 노출 안됨
- 삭제 확인 다이얼로그 필수
