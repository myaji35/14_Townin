# Story USR-001-01: Welcome & Role Selection

**Epic**: USR-001 User Onboarding & Registration
**Priority**: P0 (Critical)
**Story Points**: 2
**Status**: 📋 Planned

## User Story

**As a** new user
**I want to** see a welcoming introduction
**So that** I understand what Townin offers

## Acceptance Criteria

- [ ] Welcome 스플래시 화면
- [ ] Townin 소개 (3-4 슬라이드)
- [ ] 역할 선택 (일반사용자/상인)
- [ ] Skip 버튼
- [ ] 슬라이드 인디케이터

## Tasks

### Frontend
- [ ] Welcome splash screen component
- [ ] Intro carousel component (3-4 slides)
- [ ] Role selection screen
- [ ] Skip button implementation
- [ ] Slide transition animations
- [ ] Progress indicator (dots)

### Assets
- [ ] Intro slide images/illustrations
- [ ] Logo and branding assets
- [ ] Icon assets

### Testing
- [ ] Unit tests: Navigation logic
- [ ] E2E test: Complete intro flow
- [ ] E2E test: Skip functionality

## Technical Notes

```typescript
// Intro Carousel Component (Flutter)
class IntroCarousel extends StatefulWidget {
  @override
  _IntroCarouselState createState() => _IntroCarouselState();
}

class _IntroCarouselState extends State<IntroCarousel> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<IntroSlide> slides = [
    IntroSlide(
      title: '광고 없는 클린한\n생존 지도',
      description: 'CCTV, 가로등, 비상벨 등\n안전 인프라를 한눈에',
      image: 'assets/intro_1.png',
    ),
    IntroSlide(
      title: '무료 디지털 전단지',
      description: '우리 동네 할인 정보를\n광고 없이 깨끗하게',
      image: 'assets/intro_2.png',
    ),
    IntroSlide(
      title: '하이퍼로컬 생활 OS',
      description: '집, 회사, 본가 중심\n나만의 생활권 정보',
      image: 'assets/intro_3.png',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          PageView.builder(
            controller: _pageController,
            itemCount: slides.length,
            onPageChanged: (index) {
              setState(() => _currentPage = index);
            },
            itemBuilder: (context, index) {
              return IntroSlideWidget(slide: slides[index]);
            },
          ),

          // Skip button
          Positioned(
            top: 50,
            right: 20,
            child: TextButton(
              onPressed: () => _navigateToRoleSelection(),
              child: Text('Skip'),
            ),
          ),

          // Dots indicator
          Positioned(
            bottom: 100,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                slides.length,
                (index) => _buildDot(index),
              ),
            ),
          ),

          // Next/Get Started button
          Positioned(
            bottom: 30,
            left: 20,
            right: 20,
            child: ElevatedButton(
              onPressed: _currentPage == slides.length - 1
                  ? _navigateToRoleSelection
                  : () => _pageController.nextPage(
                        duration: Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                      ),
              child: Text(_currentPage == slides.length - 1 ? 'Get Started' : 'Next'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDot(int index) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 4),
      width: _currentPage == index ? 12 : 8,
      height: 8,
      decoration: BoxDecoration(
        color: _currentPage == index ? Color(0xFFF5A623) : Colors.grey,
        borderRadius: BorderRadius.circular(4),
      ),
    );
  }

  void _navigateToRoleSelection() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => RoleSelectionScreen()),
    );
  }
}

// Role Selection Screen
class RoleSelectionScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Townin을 어떻게\n사용하시나요?',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 60),

              // User role card
              _RoleCard(
                title: '일반 사용자',
                description: '동네 정보와 전단지를 확인하고\n포인트를 적립해요',
                icon: Icons.person,
                onTap: () => _navigateToSignUp(context, UserRole.USER),
              ),

              SizedBox(height: 20),

              // Merchant role card
              _RoleCard(
                title: '상인 (사장님)',
                description: '우리 가게 전단지를 만들고\n고객에게 알려요',
                icon: Icons.store,
                onTap: () => _navigateToSignUp(context, UserRole.MERCHANT),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _navigateToSignUp(BuildContext context, UserRole role) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => SignUpScreen(role: role),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  final String title;
  final String description;
  final IconData icon;
  final VoidCallback onTap;

  const _RoleCard({
    required this.title,
    required this.description,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(24),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Icon(icon, size: 48, color: Color(0xFFF5A623)),
            SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 8),
                  Text(
                    description,
                    style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, color: Colors.grey),
          ],
        ),
      ),
    );
  }
}
```

## Dependencies

- **Depends on**: None (entry point)
- **Blocks**: All onboarding steps

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Welcome screens implemented
- [ ] Intro carousel working
- [ ] Role selection working
- [ ] Skip functionality working
- [ ] Assets integrated
- [ ] Tests passing
- [ ] Code reviewed and merged
- [ ] UX validated

## Notes

- 스플래시는 2초 후 자동 전환
- 슬라이드는 스와이프로 넘기기 가능
- Skip 버튼은 모든 단계에서 표시
- 마지막 슬라이드에서 "Get Started" 버튼
- Role 선택은 회원가입 타입 결정
- 일반사용자/상인에 따라 온보딩 플로우 분기
