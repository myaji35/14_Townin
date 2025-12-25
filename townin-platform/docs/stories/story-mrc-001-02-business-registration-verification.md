# Story MRC-001-02: Business Registration Verification

**Epic**: MRC-001 Merchant Onboarding
**Priority**: P0 (Critical)
**Story Points**: 4
**Status**: 📋 Planned

## User Story

**As a** merchant
**I want to** verify my business registration
**So that** the platform trusts my account

## Acceptance Criteria

- [ ] 사업자 등록 번호 형식 검증 (10자리)
- [ ] 국세청 API 연동 (선택적, Phase 2)
- [ ] 수동 검증 프로세스
- [ ] 인증 완료 배지 표시
- [ ] 인증 대기 중 상태 표시

## Tasks

### Frontend
- [ ] Business verification status UI
- [ ] Verification badge component
- [ ] Pending state display

### Backend
- [ ] Business number validation logic
- [ ] Manual verification workflow
- [ ] Admin verification endpoint
- [ ] Verification status update

### Database
- [ ] Add isBusinessVerified to users table
- [ ] Add verifiedAt timestamp

### Testing
- [ ] Unit tests: Business number format
- [ ] Integration test: Verification workflow
- [ ] E2E test: Verification flow

## Technical Notes

```typescript
// Verification Status Screen (Flutter)
class BusinessVerificationScreen extends StatefulWidget {
  @override
  _BusinessVerificationScreenState createState() => _BusinessVerificationScreenState();
}

class _BusinessVerificationScreenState extends State<BusinessVerificationScreen> {
  bool _isVerified = false;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _checkVerificationStatus();
  }

  Future<void> _checkVerificationStatus() async {
    setState(() => _isLoading = true);
    try {
      final merchant = await MerchantService.getProfile();
      setState(() {
        _isVerified = merchant.isBusinessVerified;
      });
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(title: Text('사업자 인증')),
      body: Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          children: [
            Icon(
              _isVerified ? Icons.verified : Icons.pending,
              size: 100,
              color: _isVerified ? Colors.green : Colors.orange,
            ),
            SizedBox(height: 24),
            Text(
              _isVerified ? '인증 완료' : '인증 대기 중',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 16),
            Text(
              _isVerified
                  ? '사업자 등록이 확인되었습니다'
                  : '관리자 승인 대기 중입니다 (1-2 영업일)',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
            ),
          ],
        ),
      ),
    );
  }
}

// Backend: Verification Endpoints
@Patch(':id/verify-business')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.SUPER_ADMIN)
async verifyBusiness(@Param('id') id: string) {
  const user = await this.userRepo.findOne({ where: { id } });

  if (!user || user.role !== UserRole.MERCHANT) {
    throw new BadRequestException('User is not a merchant');
  }

  user.isBusinessVerified = true;
  user.verifiedAt = new Date();
  await this.userRepo.save(user);

  // Send notification email
  await this.emailService.sendBusinessVerifiedEmail(user.email);

  return { message: 'Business verified successfully' };
}

// Migration
export class AddBusinessVerification1703456789015 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'isBusinessVerified',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'verifiedAt',
        type: 'timestamp',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'isBusinessVerified');
    await queryRunner.dropColumn('users', 'verifiedAt');
  }
}
```

## Dependencies

- **Depends on**: MRC-001-01
- **Blocks**: MRC-001-03

## Definition of Done

- [ ] Verification UI implemented
- [ ] Badge component working
- [ ] Backend verification working
- [ ] Email notification sent
- [ ] Migration run
- [ ] Tests passing

## Notes

- Phase 1: 수동 검증 (관리자 승인)
- Phase 2: 국세청 API 자동 검증
- 인증 완료 시 이메일 알림
- 미인증 상태에서도 전단지 작성 가능 (표시만 차이)
