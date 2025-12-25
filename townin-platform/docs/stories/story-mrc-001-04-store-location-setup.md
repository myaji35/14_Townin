# Story MRC-001-04: Store Location Setup

**Epic**: MRC-001 Merchant Onboarding
**Priority**: P0 (Critical)
**Story Points**: 4
**Status**: 📋 Planned

## User Story

**As a** merchant
**I want to** set my store location on a map
**So that** customers can find me

## Acceptance Criteria

- [ ] 지도 기반 위치 선택
- [ ] 주소 → 좌표 변환
- [ ] H3 Grid Cell 자동 계산
- [ ] 지역(시/군/구) 자동 매핑
- [ ] 위치 확인 및 저장

## Tasks

### Frontend
- [ ] Map location picker (reuse from USR-002)
- [ ] Location confirmation
- [ ] H3 boundary visualization

### Backend
- [ ] PATCH /merchants/stores/:id/location
- [ ] H3 cell assignment
- [ ] Region mapping
- [ ] PostGIS point storage

### Database
- [ ] Add location (geometry) to stores
- [ ] Add gridCellH3Index to stores
- [ ] Add regionId to stores

### Testing
- [ ] Unit tests: H3 conversion
- [ ] Integration test: Location update
- [ ] E2E test: Map selection

## Technical Notes

```typescript
// Store Location Setup (Flutter) - Reuses MapLocationPicker
class StoreLocationSetupScreen extends StatefulWidget {
  final String storeId;

  const StoreLocationSetupScreen({required this.storeId});

  @override
  _StoreLocationSetupScreenState createState() => _StoreLocationSetupScreenState();
}

class _StoreLocationSetupScreenState extends State<StoreLocationSetupScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('상점 위치 설정')),
      body: MapLocationPicker(
        hubType: HubType.HOME, // Reuse component
        onLocationSelected: _handleLocationSelected,
      ),
    );
  }

  Future<void> _handleLocationSelected(HubData location) async {
    try {
      await MerchantService.updateStoreLocation(
        storeId: widget.storeId,
        lat: location.lat,
        lng: location.lng,
        h3Index: location.h3Index,
      );

      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => OperatingHoursSetupScreen()),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('위치 저장 실패: ${e.toString()}')),
      );
    }
  }
}

// Backend: Update Store Location
@Patch('stores/:id/location')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.MERCHANT)
async updateStoreLocation(
  @Param('id') id: string,
  @Body() dto: UpdateStoreLocationDto,
  @Req() req,
) {
  const store = await this.storeRepo.findOne({
    where: { id, ownerId: req.user.id },
  });

  if (!store) {
    throw new NotFoundException('Store not found');
  }

  // Create PostGIS Point
  const point = {
    type: 'Point',
    coordinates: [dto.lng, dto.lat],
  };

  // Get H3 index
  const h3Index = this.h3Service.latLngToH3(dto.lat, dto.lng);

  // Find region
  const region = await this.regionService.findRegionByH3Index(h3Index);

  store.location = point;
  store.gridCellH3Index = h3Index;
  store.region = region;
  store.regionId = region?.id;

  await this.storeRepo.save(store);

  return store;
}

// Migration: Add Location Fields
export class AddStoreLocationFields1703456789017 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE stores
      ADD COLUMN location geometry(Point, 4326);
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_stores_location"
      ON stores USING GIST (location);
    `);

    await queryRunner.addColumn(
      'stores',
      new TableColumn({
        name: 'gridCellH3Index',
        type: 'varchar',
        length: '15',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'stores',
      new TableColumn({
        name: 'regionId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'stores',
      new TableForeignKey({
        columnNames: ['regionId'],
        referencedTableName: 'regions',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('stores', 'regionId');
    await queryRunner.dropColumn('stores', 'gridCellH3Index');
    await queryRunner.query(`DROP INDEX "IDX_stores_location"`);
    await queryRunner.dropColumn('stores', 'location');
  }
}
```

## Dependencies

- **Depends on**: MRC-001-03, CORE-002
- **Blocks**: MRC-001-05

## Definition of Done

- [ ] Map picker working
- [ ] Location update working
- [ ] H3 conversion working
- [ ] Region mapping working
- [ ] Migration run
- [ ] Tests passing

## Notes

- MapLocationPicker 컴포넌트 재사용
- PostGIS Point로 정확한 좌표 저장
- H3 Grid Cell로 공간 인덱싱
- Region 자동 매핑 (ST_Contains)
