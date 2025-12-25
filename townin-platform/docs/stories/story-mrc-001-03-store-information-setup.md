# Story MRC-001-03: Store Information Setup

**Epic**: MRC-001 Merchant Onboarding
**Priority**: P0 (Critical)
**Story Points**: 4
**Status**: 📋 Planned

## User Story

**As a** merchant
**I want to** enter my store information
**So that** users can find my business

## Acceptance Criteria

- [ ] 상호명 입력
- [ ] 업종 선택 (드롭다운)
- [ ] 주소 검색 및 입력
- [ ] 상세 주소 입력
- [ ] 전화번호 입력 (형식 검증)
- [ ] 상점 소개 입력 (선택)

## Tasks

### Frontend
- [ ] Store info form
- [ ] Business type dropdown
- [ ] Address search integration
- [ ] Phone number formatter
- [ ] Form validation

### Backend
- [ ] POST /merchants/stores endpoint
- [ ] Store entity creation
- [ ] Address validation

### Database
- [ ] Migration: stores table

### Testing
- [ ] Unit tests: Form validation
- [ ] Integration test: Store creation
- [ ] E2E test: Store setup

## Technical Notes

```typescript
// Store Information Form (Flutter)
class StoreInformationForm extends StatefulWidget {
  @override
  _StoreInformationFormState createState() => _StoreInformationFormState();
}

class _StoreInformationFormState extends State<StoreInformationForm> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _addressController = TextEditingController();
  final _addressDetailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _descriptionController = TextEditingController();

  BusinessType? _selectedBusinessType;
  bool _isLoading = false;

  final List<BusinessTypeOption> _businessTypes = [
    BusinessTypeOption(type: BusinessType.RESTAURANT, label: '음식점', icon: Icons.restaurant),
    BusinessTypeOption(type: BusinessType.CAFE, label: '카페', icon: Icons.local_cafe),
    BusinessTypeOption(type: BusinessType.RETAIL, label: '소매점', icon: Icons.store),
    BusinessTypeOption(type: BusinessType.BEAUTY, label: '미용실', icon: Icons.content_cut),
    BusinessTypeOption(type: BusinessType.HEALTH, label: '헬스케어', icon: Icons.local_hospital),
    BusinessTypeOption(type: BusinessType.EDUCATION, label: '교육', icon: Icons.school),
    BusinessTypeOption(type: BusinessType.SERVICE, label: '서비스', icon: Icons.build),
    BusinessTypeOption(type: BusinessType.OTHER, label: '기타', icon: Icons.more_horiz),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('상점 정보 입력')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: EdgeInsets.all(24),
          children: [
            // Store Name
            TextFormField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: '상호명',
                hintText: '타운인 카페',
                prefixIcon: Icon(Icons.store),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return '상호명을 입력해주세요';
                }
                return null;
              },
            ),

            SizedBox(height: 20),

            // Business Type
            DropdownButtonFormField<BusinessType>(
              value: _selectedBusinessType,
              decoration: InputDecoration(
                labelText: '업종',
                prefixIcon: Icon(Icons.category),
              ),
              items: _businessTypes.map((bt) {
                return DropdownMenuItem(
                  value: bt.type,
                  child: Row(
                    children: [
                      Icon(bt.icon, size: 20),
                      SizedBox(width: 12),
                      Text(bt.label),
                    ],
                  ),
                );
              }).toList(),
              onChanged: (value) {
                setState(() => _selectedBusinessType = value);
              },
              validator: (value) {
                if (value == null) {
                  return '업종을 선택해주세요';
                }
                return null;
              },
            ),

            SizedBox(height: 20),

            // Address Search
            TextFormField(
              controller: _addressController,
              decoration: InputDecoration(
                labelText: '주소',
                hintText: '주소 검색',
                prefixIcon: Icon(Icons.location_on),
                suffixIcon: IconButton(
                  icon: Icon(Icons.search),
                  onPressed: _searchAddress,
                ),
              ),
              readOnly: true,
              onTap: _searchAddress,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return '주소를 입력해주세요';
                }
                return null;
              },
            ),

            SizedBox(height: 20),

            // Address Detail
            TextFormField(
              controller: _addressDetailController,
              decoration: InputDecoration(
                labelText: '상세 주소',
                hintText: '동/호수',
                prefixIcon: Icon(Icons.home),
              ),
            ),

            SizedBox(height: 20),

            // Phone
            TextFormField(
              controller: _phoneController,
              decoration: InputDecoration(
                labelText: '전화번호',
                hintText: '02-1234-5678',
                prefixIcon: Icon(Icons.phone),
              ),
              keyboardType: TextInputType.phone,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return '전화번호를 입력해주세요';
                }
                if (!RegExp(r'^[0-9-]+$').hasMatch(value)) {
                  return '올바른 전화번호 형식이 아닙니다';
                }
                return null;
              },
            ),

            SizedBox(height: 20),

            // Description
            TextFormField(
              controller: _descriptionController,
              decoration: InputDecoration(
                labelText: '상점 소개 (선택)',
                hintText: '우리 가게를 소개해주세요',
                alignLabelWithHint: true,
              ),
              maxLines: 4,
              maxLength: 500,
            ),

            SizedBox(height: 40),

            ElevatedButton(
              onPressed: _isLoading ? null : _handleSubmit,
              child: _isLoading ? CircularProgressIndicator() : Text('다음'),
              style: ElevatedButton.styleFrom(minimumSize: Size(double.infinity, 56)),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _searchAddress() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => AddressSearchScreen()),
    );

    if (result != null) {
      setState(() {
        _addressController.text = result;
      });
    }
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      await MerchantService.createStore(
        name: _nameController.text,
        businessType: _selectedBusinessType!,
        address: _addressController.text,
        addressDetail: _addressDetailController.text.isEmpty ? null : _addressDetailController.text,
        phone: _phoneController.text,
        description: _descriptionController.text.isEmpty ? null : _descriptionController.text,
      );

      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => StoreLocationSetupScreen()),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('상점 정보 저장 실패: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }
}

enum BusinessType {
  RESTAURANT, CAFE, RETAIL, BEAUTY, HEALTH, EDUCATION, SERVICE, OTHER
}

class BusinessTypeOption {
  final BusinessType type;
  final String label;
  final IconData icon;

  BusinessTypeOption({required this.type, required this.label, required this.icon});
}

// Backend: Create Store
@Post('stores')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.MERCHANT)
async createStore(@Body() dto: CreateStoreDto, @Req() req) {
  const userId = req.user.id;

  // Check if merchant already has a store
  const existing = await this.storeRepo.findOne({ where: { ownerId: userId } });
  if (existing) {
    throw new ConflictException('Merchant already has a store');
  }

  const store = this.storeRepo.create({
    ownerId: userId,
    name: dto.name,
    businessType: dto.businessType,
    address: dto.address,
    addressDetail: dto.addressDetail,
    phone: dto.phone,
    description: dto.description,
  });

  await this.storeRepo.save(store);

  return store;
}

// Migration: Stores Table
export class CreateStoresTable1703456789016 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "business_type_enum" AS ENUM (
        'restaurant', 'cafe', 'retail', 'beauty',
        'health', 'education', 'service', 'other'
      );
    `);

    await queryRunner.createTable(
      new Table({
        name: 'stores',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'ownerId', type: 'uuid', isUnique: true },
          { name: 'name', type: 'varchar' },
          { name: 'businessType', type: 'business_type_enum' },
          { name: 'address', type: 'varchar' },
          { name: 'addressDetail', type: 'varchar', isNullable: true },
          { name: 'phone', type: 'varchar' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          {
            columnNames: ['ownerId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('stores');
    await queryRunner.query(`DROP TYPE "business_type_enum"`);
  }
}
```

## Dependencies

- **Depends on**: MRC-001-01, MRC-001-02
- **Blocks**: MRC-001-04

## Definition of Done

- [ ] Form UI implemented
- [ ] Address search working
- [ ] Validation working
- [ ] Backend API working
- [ ] Migration run
- [ ] Tests passing

## Notes

- 상인은 1개 상점만 운영 가능 (Phase 1)
- 주소 검색은 Kakao API 재사용
- 전화번호 형식: 자유
- 상점 소개는 선택 사항 (최대 500자)
