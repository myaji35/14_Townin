# Google Maps & 공공 데이터 API 연동 가이드

## 📍 **Google Maps API 설정**

### 1. API 키 발급

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **API 및 서비스** → **라이브러리** 이동
4. 다음 API 활성화:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Maps JavaScript API (Web용)
5. **사용자 인증 정보** → **사용자 인증 정보 만들기** → **API 키**

### 2. 프로젝트 설정

#### **Android (android/app/src/main/AndroidManifest.xml)**
```xml
<manifest>
    <application>
        <meta-data
            android:name="com.google.android.geo.API_KEY"
            android:value="YOUR_ANDROID_API_KEY"/>
    </application>
</manifest>
```

#### **iOS (ios/Runner/AppDelegate.swift)**
```swift
import GoogleMaps

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GMSServices.provideAPIKey("YOUR_IOS_API_KEY")
    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
```

#### **Web (web/index.html)**
```html
<head>
  <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_WEB_API_KEY"></script>
</head>
```

### 3. 사용 예시

```dart
import 'package:townin_app/core/widgets/map_widget.dart';

// 지도 표시
MapWidget(
  markers: [
    MapMarker(
      id: '1',
      position: LatLng(37.7388, 127.0474),
      title: '의정부시청',
      snippet: '의정부동 195-1',
      onTap: () => print('Marker tapped'),
    ),
  ],
  initialPosition: UijeongbuLocations.cityHall,
  initialZoom: 15.0,
)
```

---

## 🏛️ **공공 데이터 포털 API 설정**

### 1. 인증키 발급

1. [공공 데이터 포털](https://www.data.go.kr/) 접속 및 회원가입
2. **데이터 활용 신청** → 각 API 검색 및 신청

#### **필요한 API 목록**
| API | 제공기관 | 용도 |
|-----|----------|------|
| 지방행정인허가데이터_CCTV설치현황 | 안전행정부 | Safety Map |
| 공영주차장정보 | 국토교통부 | Parking Map |
| 민방위대피소표준데이터 | 행정안전부 | Risk Map |
| 전국병원정보서비스 | 보건복지부 | Life Map |
| 의약품개방API | 식품의약품안전처 | Life Map |

### 2. 환경 변수 설정

**.env 파일 생성** (프로젝트 루트):
```env
PUBLIC_DATA_API_KEY=your_public_data_api_key_here
```

**Flutter 실행 시 환경 변수 전달**:
```bash
flutter run --dart-define=PUBLIC_DATA_API_KEY=your_key_here
```

### 3. 사용 예시

```dart
import 'package:townin_app/core/api/public_data_api_client.dart';

final apiClient = PublicDataAPIClient();

// CCTV 정보 조회
final cctvList = await apiClient.getCCTVList(
  sigunguName: '의정부시',
  pageNo: 1,
  numOfRows: 100,
);

// 주차장 정보 조회
final parkingList = await apiClient.getParkingList(
  sigunguName: '의정부시',
);

// 대피소 정보 조회
final shelterList = await apiClient.getShelterList(
  sigunguName: '의정부시',
);
```

---

## 🔧 **통합 사용 패턴**

### Map + Public Data API

```dart
import 'package:flutter/material.dart';
import 'package:townin_app/core/widgets/map_widget.dart';
import 'package:townin_app/core/api/public_data_api_client.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class IntegratedMapScreen extends StatefulWidget {
  @override
  _IntegratedMapScreenState createState() => _IntegratedMapScreenState();
}

class _IntegratedMapScreenState extends State<IntegratedMapScreen> {
  final _apiClient = PublicDataAPIClient();
  List<MapMarker> _markers = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      // 공공 데이터 API에서 CCTV 정보 로드
      final cctvList = await _apiClient.getCCTVList();
      
      setState(() {
        _markers = cctvList.map((cctv) {
          return MapMarker(
            id: cctv.id,
            position: LatLng(cctv.lat, cctv.lng),
            title: cctv.name,
            snippet: cctv.location,
            icon: await MapMarkerIcons.cctv(),
          );
        }).toList();
        _loading = false;
      });
    } catch (e) {
      print('Error loading data: $e');
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Center(child: CircularProgressIndicator());
    }

    return MapWidget(
      markers: _markers,
      initialPosition: UijeongbuLocations.cityHall,
      initialZoom: 14.0,
    );
  }
}
```

---

## ⚠️ **주의사항**

### Google Maps API
1. **API 키 보안**: 절대 GitHub에 커밋하지 말 것 (.gitignore 추가)
2. **사용량 제한**: 무료 크레딧($200/월) 초과 시 과금
3. **API 제한**: Android/iOS/Web별로 별도 키 사용 권장

### 공공 데이터 API
1. **트래픽 제한**: API당 일일 호출 제한 (보통 1,000건)
2. **승인 대기**: 신청 후 1-2일 승인 대기
3. **Mock 데이터**: API 실패 시 자동으로 Mock 데이터 사용
4. **캐싱**: 동일 데이터 반복 호출 방지를 위한 캐싱 구현 권장

---

## 📊 **의정부시 행정구역 코드**

| 구역 | 코드 |
|------|------|
| 의정부시 | 41150 |
| 의정부동 | 4115010100 |
| 호원동 | 4115010200 |
| 신곡동 | 4115010300 |
| 장암동 | 4115010500 |

---

## 🧪 **테스트 방법**

### 1. Map Widget 테스트
```bash
flutter run --dart-define=GOOGLE_MAPS_API_KEY=your_key
```

### 2. Public Data API 테스트
```bash
flutter run --dart-define=PUBLIC_DATA_API_KEY=your_key
```

### 3. 통합 테스트
```bash
flutter run \
  --dart-define=GOOGLE_MAPS_API_KEY=your_google_key \
  --dart-define=PUBLIC_DATA_API_KEY=your_public_data_key
```

---

## 📚 **참고 자료**

- [Google Maps Flutter Plugin](https://pub.dev/packages/google_maps_flutter)
- [공공 데이터 포털](https://www.data.go.kr/)
- [의정부시 공공 데이터](https://www.data.go.kr/tcs/dss/selectDataSetList.do?keyword=%EC%9D%98%EC%A0%95%EB%B6%80)

---

**작성일**: 2026-01-04  
**마지막 업데이트**: Google Maps & 공공 데이터 API 연동 가이드 작성
