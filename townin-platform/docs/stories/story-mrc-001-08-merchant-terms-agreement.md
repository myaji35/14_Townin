# Story MRC-001-08: Merchant Terms Agreement

**Epic**: MRC-001 Merchant Onboarding
**Priority**: P0 (Critical)
**Story Points**: 2
**Status**: 📋 Planned

## User Story

**As a** merchant
**I want to** agree to merchant-specific terms
**So that** I comply with platform policies

## Acceptance Criteria

- [ ] 상인용 약관 표시
  - 서비스 이용약관
  - 전단지 게시 정책
  - 수수료 정책 (미래)
- [ ] 필수 약관 동의 필수
- [ ] 약관 상세 보기
- [ ] 동의 기록 저장

## Tasks

### Frontend
- [ ] Merchant terms UI (reuse USR-001-07)
- [ ] Terms detail modal
- [ ] Agreement submission

### Backend
- [ ] Merchant agreement tracking (reuse user_agreements)
- [ ] Merchant-specific agreement types

### Legal
- [ ] Merchant terms of service content
- [ ] Flyer posting policy content

### Testing
- [ ] Integration test: Agreement save
- [ ] E2E test: Complete onboarding

## Technical Notes

```typescript
// Merchant Terms Agreement (Flutter) - Reuses TermsAgreementScreen
class MerchantTermsAgreementScreen extends StatefulWidget {
  @override
  _MerchantTermsAgreementScreenState createState() => _MerchantTermsAgreementScreenState();
}

class _MerchantTermsAgreementScreenState extends State<MerchantTermsAgreementScreen> {
  final Map<MerchantAgreementType, bool> _agreements = {
    MerchantAgreementType.MERCHANT_TERMS: false,
    MerchantAgreementType.FLYER_POSTING_POLICY: false,
    MerchantAgreementType.PRIVACY_POLICY: false,
  };

  bool _agreeAll = false;
  bool _isLoading = false;

  final List<TermItem> terms = [
    TermItem(
      type: MerchantAgreementType.MERCHANT_TERMS,
      title: '상인 서비스 이용약관',
      isRequired: true,
    ),
    TermItem(
      type: MerchantAgreementType.FLYER_POSTING_POLICY,
      title: '전단지 게시 정책',
      isRequired: true,
    ),
    TermItem(
      type: MerchantAgreementType.PRIVACY_POLICY,
      title: '개인정보 처리방침',
      isRequired: true,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('약관 동의')),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: EdgeInsets.all(24),
              children: [
                Text(
                  'Townin 상인 서비스 이용을 위해\n약관에 동의해주세요',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),

                SizedBox(height: 40),

                // All agree
                Container(
                  padding: EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Color(0xFFF5A623).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: CheckboxListTile(
                    title: Text('전체 동의', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    value: _agreeAll,
                    onChanged: (value) {
                      setState(() {
                        _agreeAll = value ?? false;
                        _agreements.updateAll((key, _) => _agreeAll);
                      });
                    },
                    activeColor: Color(0xFFF5A623),
                    controlAffinity: ListTileControlAffinity.leading,
                  ),
                ),

                SizedBox(height: 20),

                // Individual terms
                ...terms.map((term) => _TermCheckbox(
                  term: term,
                  isAgreed: _agreements[term.type] ?? false,
                  onChanged: (value) {
                    setState(() {
                      _agreements[term.type] = value ?? false;
                      _updateAllAgreeState();
                    });
                  },
                  onDetailTap: () => _showTermDetail(term),
                )),
              ],
            ),
          ),

          Padding(
            padding: EdgeInsets.all(24),
            child: ElevatedButton(
              onPressed: _canProceed() && !_isLoading ? _handleSubmit : null,
              child: _isLoading ? CircularProgressIndicator() : Text('동의하고 시작하기'),
              style: ElevatedButton.styleFrom(minimumSize: Size(double.infinity, 56)),
            ),
          ),
        ],
      ),
    );
  }

  void _updateAllAgreeState() {
    _agreeAll = _agreements.values.every((agreed) => agreed);
  }

  bool _canProceed() {
    return terms
        .where((term) => term.isRequired)
        .every((term) => _agreements[term.type] == true);
  }

  Future<void> _showTermDetail(TermItem term) async {
    await showDialog(
      context: context,
      builder: (context) => TermDetailDialog(termType: term.type),
    );
  }

  Future<void> _handleSubmit() async {
    if (!_canProceed()) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('필수 약관에 모두 동의해주세요')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      await MerchantService.saveAgreements(_agreements);

      // Navigate to store setup
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => StoreInformationForm()),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('약관 동의 실패: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }
}

enum MerchantAgreementType {
  MERCHANT_TERMS,
  FLYER_POSTING_POLICY,
  PRIVACY_POLICY,
}

// Backend: Save Merchant Agreements (extends user_agreements table)
@Post('agreements')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.MERCHANT)
async saveMerchantAgreements(@Body() dto: SaveAgreementsDto, @Req() req) {
  const userId = req.user.id;

  const agreements = dto.agreements.map(agreement =>
    this.agreementRepo.create({
      userId,
      type: agreement.type,
      agreed: agreement.agreed,
      agreedAt: new Date(),
      version: 'v1.0',
    })
  );

  await this.agreementRepo.save(agreements);

  return { message: 'Agreements saved successfully' };
}

// User Agreement Entity (Extended with merchant types)
@Entity('user_agreements')
export class UserAgreement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: AgreementType,
  })
  type: AgreementType;

  @Column()
  agreed: boolean;

  @Column({ type: 'timestamp' })
  agreedAt: Date;

  @Column()
  version: string;
}

export enum AgreementType {
  // User agreements
  TERMS_OF_SERVICE = 'TERMS_OF_SERVICE',
  PRIVACY_POLICY = 'PRIVACY_POLICY',
  LOCATION_TERMS = 'LOCATION_TERMS',
  MARKETING = 'MARKETING',

  // Merchant agreements
  MERCHANT_TERMS = 'MERCHANT_TERMS',
  FLYER_POSTING_POLICY = 'FLYER_POSTING_POLICY',
}
```

## Dependencies

- **Depends on**: MRC-001-01
- **Blocks**: MRC-001-03

## Definition of Done

- [ ] Terms UI implemented
- [ ] Agreement save working
- [ ] Terms content finalized
- [ ] Backend integration working
- [ ] Tests passing

## Notes

- 상인 회원가입 시 필수
- 기존 user_agreements 테이블 재사용
- AgreementType enum에 상인용 타입 추가
- 필수 약관: 상인 이용약관, 전단지 게시 정책, 개인정보
- 약관 버전 관리 (v1.0)
- Phase 2에서 수수료 정책 추가
