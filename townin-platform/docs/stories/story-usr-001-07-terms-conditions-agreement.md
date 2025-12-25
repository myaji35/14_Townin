# Story USR-001-07: Terms & Conditions Agreement

**Epic**: USR-001 User Onboarding & Registration
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** new user
**I want to** review and agree to terms
**So that** I comply with legal requirements

## Acceptance Criteria

- [ ] 약관 목록 표시 (필수/선택 구분)
- [ ] 전체 동의 체크박스
- [ ] 개별 약관 상세 보기
- [ ] 필수 약관 미동의 시 진행 불가
- [ ] 동의 기록 저장

## Tasks

### Frontend
- [ ] Terms agreement UI
- [ ] Terms detail modal/page
- [ ] All-agree checkbox logic
- [ ] Individual checkbox handling
- [ ] Required terms validation

### Backend
- [ ] POST /users/:id/agreements endpoint
- [ ] UserAgreement entity creation
- [ ] Bulk insert agreements

### Legal
- [ ] Terms of Service content
- [ ] Privacy Policy content
- [ ] Location Terms content

### Database
- [ ] Migration: user_agreements table

### Testing
- [ ] Unit tests: Agreement validation
- [ ] Integration test: Save agreements
- [ ] E2E test: Complete flow

## Technical Notes

```typescript
// Terms Agreement Screen
class TermsAgreementScreen extends StatefulWidget {
  final SocialProfile? socialProfile;

  const TermsAgreementScreen({this.socialProfile});

  @override
  _TermsAgreementScreenState createState() => _TermsAgreementScreenState();
}

class _TermsAgreementScreenState extends State<TermsAgreementScreen> {
  bool _agreeAll = false;
  final Map<AgreementType, bool> _agreements = {
    AgreementType.TERMS_OF_SERVICE: false,
    AgreementType.PRIVACY_POLICY: false,
    AgreementType.LOCATION_TERMS: false,
    AgreementType.MARKETING: false,
  };

  bool _isLoading = false;

  final List<TermItem> terms = [
    TermItem(
      type: AgreementType.TERMS_OF_SERVICE,
      title: '서비스 이용약관',
      isRequired: true,
    ),
    TermItem(
      type: AgreementType.PRIVACY_POLICY,
      title: '개인정보 처리방침',
      isRequired: true,
    ),
    TermItem(
      type: AgreementType.LOCATION_TERMS,
      title: '위치기반 서비스 이용약관',
      isRequired: true,
    ),
    TermItem(
      type: AgreementType.MARKETING,
      title: '마케팅 정보 수신 동의',
      isRequired: false,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('약관 동의'),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: EdgeInsets.all(24),
              children: [
                Text(
                  'Townin 서비스 이용을 위해\n약관에 동의해주세요',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),

                SizedBox(height: 40),

                // All agree checkbox
                Container(
                  padding: EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Color(0xFFF5A623).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: CheckboxListTile(
                    title: Text(
                      '전체 동의',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
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

          // Next button
          Padding(
            padding: EdgeInsets.all(24),
            child: ElevatedButton(
              onPressed: _canProceed() && !_isLoading ? _handleSubmit : null,
              child: _isLoading
                  ? CircularProgressIndicator()
                  : Text('다음'),
              style: ElevatedButton.styleFrom(
                minimumSize: Size(double.infinity, 50),
              ),
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
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => TermDetailScreen(termType: term.type),
      ),
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
      // Create user account with social profile if available
      User user;
      if (widget.socialProfile != null) {
        user = await AuthService.completeSocialRegistration(
          profile: widget.socialProfile!,
          agreements: _agreements,
        );
      } else {
        // For email registration, get current user
        user = await UserService.getCurrentUser();
        await UserService.saveAgreements(
          userId: user.id,
          agreements: _agreements,
        );
      }

      // Navigate to personal info
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => PersonalInfoForm(user: user),
        ),
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

class _TermCheckbox extends StatelessWidget {
  final TermItem term;
  final bool isAgreed;
  final ValueChanged<bool?> onChanged;
  final VoidCallback onDetailTap;

  const _TermCheckbox({
    required this.term,
    required this.isAgreed,
    required this.onChanged,
    required this.onDetailTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Checkbox(
            value: isAgreed,
            onChanged: onChanged,
            activeColor: Color(0xFFF5A623),
          ),
          Expanded(
            child: GestureDetector(
              onTap: () => onChanged(!isAgreed),
              child: Row(
                children: [
                  if (term.isRequired)
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Color(0xFFF5A623),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        '필수',
                        style: TextStyle(fontSize: 10, color: Colors.white),
                      ),
                    ),
                  if (!term.isRequired)
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        '선택',
                        style: TextStyle(fontSize: 10, color: Colors.grey.shade700),
                      ),
                    ),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(term.title, style: TextStyle(fontSize: 14)),
                  ),
                ],
              ),
            ),
          ),
          IconButton(
            icon: Icon(Icons.chevron_right, color: Colors.grey),
            onPressed: onDetailTap,
          ),
        ],
      ),
    );
  }
}

class TermItem {
  final AgreementType type;
  final String title;
  final bool isRequired;

  TermItem({
    required this.type,
    required this.title,
    required this.isRequired,
  });
}

// Term Detail Screen
class TermDetailScreen extends StatelessWidget {
  final AgreementType termType;

  const TermDetailScreen({required this.termType});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_getTermTitle()),
      ),
      body: FutureBuilder<String>(
        future: _loadTermContent(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('약관을 불러올 수 없습니다'));
          }

          return SingleChildScrollView(
            padding: EdgeInsets.all(24),
            child: Text(
              snapshot.data ?? '',
              style: TextStyle(fontSize: 14, height: 1.6),
            ),
          );
        },
      ),
    );
  }

  String _getTermTitle() {
    switch (termType) {
      case AgreementType.TERMS_OF_SERVICE:
        return '서비스 이용약관';
      case AgreementType.PRIVACY_POLICY:
        return '개인정보 처리방침';
      case AgreementType.LOCATION_TERMS:
        return '위치기반 서비스 이용약관';
      case AgreementType.MARKETING:
        return '마케팅 정보 수신 동의';
    }
  }

  Future<String> _loadTermContent() async {
    // Load from assets or API
    final content = await rootBundle.loadString('assets/terms/${termType.toString().split('.').last.toLowerCase()}.md');
    return content;
  }
}

// Backend: Save Agreements
@Post(':id/agreements')
@UseGuards(JwtAuthGuard)
async saveAgreements(
  @Param('id') id: string,
  @Body() dto: SaveAgreementsDto,
) {
  const agreements = dto.agreements.map(agreement =>
    this.userAgreementRepo.create({
      userId: id,
      type: agreement.type,
      agreed: agreement.agreed,
      agreedAt: new Date(),
      version: 'v1.0',
    })
  );

  await this.userAgreementRepo.save(agreements);

  return { message: 'Agreements saved' };
}
```

## Dependencies

- **Depends on**: USR-001-02 or USR-001-03 (Registration)
- **Blocks**: USR-001-04 (Personal Info)

## Definition of Done

- [ ] All acceptance criteria met
- [ ] UI implemented
- [ ] All-agree logic working
- [ ] Required validation working
- [ ] Detail view working
- [ ] Save agreements API working
- [ ] Migration run
- [ ] Legal content finalized
- [ ] Tests passing
- [ ] Code reviewed and merged

## Notes

- 필수 약관 3개, 선택 약관 1개
- 전체 동의 시 모든 약관 자동 체크
- 개별 약관 해제 시 전체 동의 자동 해제
- 약관 상세는 Markdown 또는 HTML 형식
- 약관 버전 관리 (v1.0, v1.1 등)
- GDPR 준수: 마케팅 동의는 선택
