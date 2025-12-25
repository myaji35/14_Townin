# Flutter UI 구현 가이드

## 구현 완료 내용

Flutter 전단지 뷰어 UI가 완전히 구현되었습니다.

---

## 📁 파일 구조

```
frontend/lib/
├── core/
│   ├── enums/
│   │   ├── flyer_category.dart          # 카테고리 enum
│   │   └── flyer_status.dart            # 상태 enum
│   └── models/
│       ├── flyer_model.dart             # 전단지 모델
│       ├── flyer_model.g.dart           # JSON 직렬화
│       ├── merchant_model.dart          # 상인 모델
│       ├── merchant_model.g.dart
│       ├── flyer_list_response.dart     # 페이지네이션 응답
│       └── flyer_list_response.g.dart
└── features/
    └── flyers/
        ├── bloc/
        │   ├── flyer_bloc.dart          # BLoC 로직
        │   ├── flyer_event.dart         # 이벤트 정의
        │   └── flyer_state.dart         # 상태 정의
        ├── data/
        │   └── flyer_api_service.dart   # API 서비스
        ├── widgets/
        │   ├── flyer_card.dart          # 전단지 카드 위젯
        │   └── category_filter_bar.dart # 카테고리 필터 바
        └── presentation/
            ├── flyer_list_screen.dart   # 목록 화면
            └── flyer_detail_screen.dart # 상세 화면
```

---

## 🎨 구현된 화면

### 1. 전단지 목록 화면 (FlyerListScreen)

**위치**: `lib/features/flyers/presentation/flyer_list_screen.dart`

**기능**:
- ✅ 위치 기반 전단지 표시
- ✅ 검색 기능 (키워드)
- ✅ 카테고리 필터 (8개 카테고리)
- ✅ 무한 스크롤 (페이지네이션)
- ✅ Pull to refresh
- ✅ 로딩/에러 상태 처리
- ✅ 빈 상태 UI

**사용 예제**:
```dart
// 위치 기반 로드
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => BlocProvider(
      create: (context) => FlyerBloc(),
      child: FlyerListScreen(h3Index: '8a2a1005892ffff'),
    ),
  ),
);

// 인기 전단지 로드 (h3Index 없이)
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => BlocProvider(
      create: (context) => FlyerBloc(),
      child: FlyerListScreen(),
    ),
  ),
);
```

### 2. 전단지 상세 화면 (FlyerDetailScreen)

**위치**: `lib/features/flyers/presentation/flyer_detail_screen.dart`

**기능**:
- ✅ 전단지 이미지 (확대 가능한 AppBar)
- ✅ 카테고리, 제목, 설명
- ✅ 조회수/클릭수 통계
- ✅ 상인 정보 (상호명, 전화번호, 주소)
- ✅ 추가 정보 (타겟 반경, 시작일, 만료일)
- ✅ 자동 조회 추적 (Analytics)
- ✅ 로딩/에러 상태 처리

**사용 예제**:
```dart
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => FlyerDetailScreen(
      flyerId: 'flyer-uuid',
    ),
  ),
);
```

---

## 🔧 BLoC State Management

### FlyerBloc

**위치**: `lib/features/flyers/bloc/flyer_bloc.dart`

**지원하는 이벤트**:
```dart
// 위치 기반 로드
LoadFlyersByLocation(h3Index: string, radius: int)

// 검색
SearchFlyers(keyword: string, category: FlyerCategory?)

// 카테고리 필터
FilterFlyersByCategory(category: FlyerCategory)

// 인기 전단지
LoadFeaturedFlyers(limit: int)

// 더 보기 (페이지네이션)
LoadMoreFlyers()

// 새로고침
RefreshFlyers()

// 필터 초기화
ClearFilters()
```

**상태**:
```dart
// 초기 상태
FlyerInitial

// 로딩 중
FlyerLoading

// 로드 완료
FlyerLoaded {
  List<FlyerModel> flyers,
  int total,
  int currentPage,
  bool hasMore,
  bool isLoadingMore,
}

// 에러
FlyerError(message: string)
```

---

## 🎨 위젯 컴포넌트

### 1. FlyerCard

**위치**: `lib/features/flyers/widgets/flyer_card.dart`

**기능**:
- 전단지 이미지 (16:9 비율)
- 카테고리 배지 (색상 구분)
- 제목, 설명 (2줄 제한)
- 상인 정보
- 통계 (조회수, 클릭수)
- 생성일 (상대 시간 표시)

**Props**:
```dart
FlyerCard({
  required FlyerModel flyer,
  required VoidCallback onTap,
})
```

**카테고리 색상**:
- 음식: Orange
- 패션: Purple
- 뷰티: Pink
- 교육: Blue
- 건강: Green
- 엔터테인먼트: Red
- 서비스: Teal
- 기타: Grey

### 2. CategoryFilterBar

**위치**: `lib/features/flyers/widgets/category_filter_bar.dart`

**기능**:
- 수평 스크롤 카테고리 필터
- "전체" + 8개 카테고리
- 선택된 카테고리 하이라이트

**Props**:
```dart
CategoryFilterBar({
  required FlyerCategory? selectedCategory,
  required Function(FlyerCategory?) onCategorySelected,
})
```

---

## 🚀 사용 방법

### 1. 앱에 통합하기

**main.dart 또는 라우터 설정**:

```dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'features/flyers/bloc/flyer_bloc.dart';
import 'features/flyers/presentation/flyer_list_screen.dart';

// 전역 BLoC 제공
MultiBlocProvider(
  providers: [
    BlocProvider<FlyerBloc>(
      create: (context) => FlyerBloc(),
    ),
    // ... other blocs
  ],
  child: MyApp(),
)

// 또는 필요한 화면에서만 제공
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => BlocProvider(
      create: (context) => FlyerBloc()
        ..add(LoadFlyersByLocation(h3Index: userH3Index)),
      child: FlyerListScreen(),
    ),
  ),
);
```

### 2. 위치 기반 전단지 표시

```dart
class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () async {
        // 1. 사용자 위치 가져오기
        final position = await Geolocator.getCurrentPosition();

        // 2. H3 인덱스 변환 (h3_dart 패키지 사용)
        final h3Index = geoToH3(
          position.latitude,
          position.longitude,
          9, // resolution
        );

        // 3. 전단지 목록 화면으로 이동
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => BlocProvider(
              create: (context) => FlyerBloc()
                ..add(LoadFlyersByLocation(
                  h3Index: h3Index,
                  radius: 2, // 2km
                )),
              child: FlyerListScreen(h3Index: h3Index),
            ),
          ),
        );
      },
      child: Text('내 주변 전단지 보기'),
    );
  }
}
```

### 3. 검색 기능

전단지 목록 화면에 내장되어 있습니다:
- 검색창에 키워드 입력
- Enter 키 또는 검색 버튼 클릭
- 카테고리 필터와 함께 사용 가능

```dart
// 프로그래밍 방식으로 검색
context.read<FlyerBloc>().add(
  SearchFlyers(
    keyword: '할인',
    category: FlyerCategory.food,
  ),
);
```

### 4. 카테고리 필터

```dart
// 프로그래밍 방식으로 필터링
context.read<FlyerBloc>().add(
  FilterFlyersByCategory(FlyerCategory.fashion),
);

// UI에서 사용자가 선택
// CategoryFilterBar가 자동으로 처리
```

---

## 📊 Analytics 추적

### 자동 추적

전단지 상세 화면 진입 시:
- `trackFlyerView()` 자동 호출
- Backend의 `POST /api/flyers/:id/view` 호출
- Analytics 이벤트: `flyer_view` 생성

향후 구현 가능:
```dart
// 클릭 추적 (예: 전화 걸기, 주소 복사 등)
onCallButtonPressed() async {
  await _apiService.trackFlyerClick(flyerId);
  // 전화 걸기 로직
}
```

---

## 🎨 커스터마이징

### 테마 색상 변경

**FlyerCard 카테고리 색상**:
```dart
// flyer_card.dart의 _getCategoryColor() 메서드 수정
Color _getCategoryColor(category) {
  switch (category.name) {
    case 'food':
      return Colors.orange;  // 원하는 색상으로 변경
    // ...
  }
}
```

### 카드 레이아웃 변경

**FlyerCard** 위젯을 직접 수정:
- 이미지 비율: `AspectRatio(aspectRatio: 16 / 9)`
- 패딩, 폰트 크기 조정 가능

### 페이지당 아이템 수

**FlyerBloc**:
```dart
class FlyerBloc extends Bloc<FlyerEvent, FlyerState> {
  int _itemsPerPage = 20; // 원하는 숫자로 변경
  // ...
}
```

---

## 🐛 알려진 제한사항 및 향후 개선

### 현재 제한사항

1. **H3 Grid 미구현**: 백엔드에서 H3 k-ring 쿼리 미구현
   - 현재는 merchant의 gridCell로 필터링
   - 정확한 반경 검색 불가

2. **이미지 캐싱**: 네트워크 이미지 캐싱 최적화 필요
   - `cached_network_image` 패키지 도입 권장

3. **오프라인 지원**: 오프라인 모드 미지원
   - SQLite 로컬 캐싱 필요

### 향후 개선 사항

#### 1. 찜하기 기능
```dart
// 전단지 즐겨찾기
class FavoriteFlyersBloc extends Bloc<...> {
  Future<void> toggleFavorite(String flyerId);
  Future<List<FlyerModel>> getFavorites();
}
```

#### 2. 공유 기능
```dart
// 전단지 공유
import 'package:share_plus/share_plus.dart';

void shareFl yer(FlyerModel flyer) {
  Share.share(
    '${flyer.title}\n${flyer.merchant?.businessName}\n\nTownin 앱에서 보기',
    subject: flyer.title,
  );
}
```

#### 3. 지도 뷰
```dart
// 지도에 전단지 표시
class FlyerMapScreen extends StatelessWidget {
  // Google Maps + Markers
}
```

#### 4. 필터 고급 옵션
```dart
// 거리, 가격대, 할인율 등
class AdvancedFilterSheet extends StatelessWidget {
  // BottomSheet with multiple filters
}
```

#### 5. 이미지 확대/줌
```dart
// photo_view 패키지 사용
import 'package:photo_view/photo_view.dart';

class FullScreenImage extends StatelessWidget {
  // 전체 화면 이미지 뷰어
}
```

---

## 📝 테스트 가이드

### Widget 테스트 예제

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mockito/mockito.dart';

void main() {
  group('FlyerListScreen', () {
    testWidgets('displays loading indicator', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: BlocProvider(
            create: (_) => FlyerBloc(),
            child: FlyerListScreen(),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('displays flyer cards when loaded', (tester) async {
      final mockBloc = MockFlyerBloc();
      when(mockBloc.state).thenReturn(
        FlyerLoaded(
          flyers: [mockFlyer1, mockFlyer2],
          total: 2,
        ),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: BlocProvider<FlyerBloc>.value(
            value: mockBloc,
            child: FlyerListScreen(),
          ),
        ),
      );

      expect(find.byType(FlyerCard), findsNWidgets(2));
    });
  });
}
```

### BLoC 테스트 예제

```dart
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';

void main() {
  group('FlyerBloc', () {
    late MockFlyerApiService mockApiService;
    late FlyerBloc bloc;

    setUp(() {
      mockApiService = MockFlyerApiService();
      bloc = FlyerBloc(apiService: mockApiService);
    });

    blocTest<FlyerBloc, FlyerState>(
      'emits [FlyerLoading, FlyerLoaded] when LoadFlyersByLocation succeeds',
      build: () {
        when(mockApiService.getFlyersByLocation(
          h3Index: any,
          radius: any,
          page: any,
          limit: any,
        )).thenAnswer((_) async => mockResponse);
        return bloc;
      },
      act: (bloc) => bloc.add(
        LoadFlyersByLocation(h3Index: 'test-h3'),
      ),
      expect: () => [
        FlyerLoading(),
        FlyerLoaded(flyers: mockFlyers, total: 10),
      ],
    );
  });
}
```

---

## 🎯 체크리스트

### 구현 완료
- [x] Flyer 모델 및 enum
- [x] FlyerApiService
- [x] FlyerBloc (State Management)
- [x] FlyerCard 위젯
- [x] CategoryFilterBar 위젯
- [x] FlyerListScreen (목록 화면)
- [x] FlyerDetailScreen (상세 화면)
- [x] 검색 기능
- [x] 카테고리 필터
- [x] 무한 스크롤
- [x] Pull to refresh
- [x] Analytics 추적 (view)
- [x] 로딩/에러 상태 처리

### 미구현 (향후 작업)
- [ ] 찜하기 기능
- [ ] 공유 기능
- [ ] 지도 뷰
- [ ] 고급 필터 (거리, 가격대)
- [ ] 이미지 확대/줌
- [ ] 오프라인 지원
- [ ] 이미지 캐싱 최적화
- [ ] Unit/Widget 테스트
- [ ] H3 Grid 정확한 반경 검색

---

## 📚 관련 문서

- **Backend API**: `/backend/docs/USR-007-implementation-summary.md`
- **MVP 가이드**: `/docs/MVP-implementation-summary.md`
- **Flutter BLoC**: https://bloclibrary.dev/
- **Dio**: https://pub.dev/packages/dio

---

**작성일**: 2025-02-01
**버전**: 1.0.0
**상태**: ✅ 구현 완료
