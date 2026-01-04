# 🎯 AR 기능 통합 완료 가이드

## ✅ **완료된 작업**

### **1. 패키지 설치**
- ✅ `arcore_flutter_plugin` (Android ARCore)
- ✅ `arkit_plugin` (iOS ARKit)
- ✅ `camera` (카메라 접근)
- ✅ `sensors_plus` (나침반, 가속도계)
- ✅ `vector_math` (3D 수학)

### **2. 구현된 컴포넌트**

#### **AR View** (`lib/presentation/ar/`)
- ✅ `android_ar_view.dart` - Android ARCore View
- ✅ `ios_ar_view.dart` - iOS ARKit View
- ✅ `real_ar_flyer_viewer_screen.dart` - 통합 AR 화면

#### **유틸리티** (`lib/core/`)
- ✅ `location_ar_converter.dart` - GPS → AR 좌표 변환
- ✅ `compass_service.dart` - 나침반 서비스

### **3. 플랫폼 설정**
- ✅ `android/app/src/main/AndroidManifest.xml` - ARCore 권한
- ✅ `ios/Runner/Info.plist` - ARKit 권한

---

## 🚀 **빠른 시작**

### **1. 의존성 설치**
```bash
cd townin-platform/townin_app
flutter pub get
```

### **2. Android 빌드**
```bash
# ARCore 지원 기기 필요 (Android 7.0+)
flutter run -d android
```

### **3. iOS 빌드**
```bash
# ARKit 지원 기기 필요 (iPhone 6s+, iOS 12+)
cd ios
pod install
cd ..
flutter run -d ios
```

---

## 📱 **디바이스 요구사항**

### **Android**
- ✅ **OS**: Android 7.0 (API 24) 이상
- ✅ **ARCore**: [지원 기기 목록](https://developers.google.com/ar/devices)
- ✅ **카메라**: Auto-focus 지원
- ✅ **센서**: 자이로스코프, 가속도계

### **iOS**
- ✅ **OS**: iOS 12.0 이상
- ✅ **기기**: iPhone 6s 이상, iPad (5th generation) 이상
- ✅ **프로세서**: A9 칩 이상
- ✅ **센서**: TrueDepth (선택사항)

---

## 🔧 **사용 방법**

### **라우팅 설정**

`lib/main.dart`에서 AR 화면을 라우트에 추가:

```dart
import 'presentation/ar/real_ar_flyer_viewer_screen.dart';

// RouteGenerator 또는 routes 맵에 추가
'/ar-viewer': (context) => const RealARFlyerViewerScreen(),
```

### **화면 이동**

```dart
// Simulated AR (개발/테스트용)
Navigator.pushNamed(context, '/ar-flyer-viewer');

// Real AR (실제 ARCore/ARKit)
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => const RealARFlyerViewerScreen(),
  ),
);
```

---

## 🎮 **기능 설명**

### **1. 자동 권한 요청**
- 카메라 권한
- 위치 권한
- 권한 거부 시 설정 화면으로 안내

### **2. 실시간 위치 기반 AR**
- GPS로 현재 위치 파악
- 주변 전단지 위치 계산
- 100m 이내, 90도 시야각 필터링

### **3. 나침반 통합**
- Magnetometer + Accelerometer 융합
- 틸트 보정된 Heading 계산
- 실시간 방향 업데이트

### **4. AR 마커**
- 3D 구체 (Sphere) 형태
- 상점 이름 텍스트 라벨
- 거리별 LOD (Level of Detail)
- 탭하여 전단지 상세 보기

### **5. 플랫폼 감지**
- Android → ARCore
- iOS → ARKit
- Web/Desktop → 지원 안 함 메시지

---

## 📊 **AR 좌표 시스템**

### **GPS → AR 변환**

```dart
final arPosition = LocationARConverter.gpsToARPosition(
  currentLat: 37.7414,      // 현재 위도
  currentLng: 127.0471,     // 현재 경도
  targetLat: 37.7420,       // 목표 위도
  targetLng: 127.0480,      // 목표 경도
  bearing: 45.0,            // 나침반 방향 (0-360도)
);

// arPosition: Vector3(x, y, z)
// x: 좌/우 (-/+)
// y: 상/하
// z: 앞/뒤 (-앞/+뒤)
```

### **거리 계산 (Haversine)**

```dart
final distance = LocationARConverter.calculateDistance(
  37.7414, 127.0471,  // 현재 위치
  37.7420, 127.0480,  // 목표 위치
);
// distance: meters
```

### **Viewport 체크**

```dart
final isVisible = LocationARConverter.isInViewport(
  arPosition,
  maxDistance: 100,  // 100m 제한
  maxAngle: 90,      // 90도 시야각
);
```

---

## 🔍 **문제 해결**

### **ARCore 인식 안 됨 (Android)**

```bash
# Google Play Services for AR 설치
adb install -r google_play_services_for_ar.apk

# ARCore 버전 확인
adb shell pm list packages | grep arcore
```

### **ARKit 빌드 에러 (iOS)**

```bash
# Pod 재설치
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
```

### **권한 에러**

AndroidManifest.xml / Info.plist 확인:
- `android.permission.CAMERA` (Android)
- `NSCameraUsageDescription` (iOS)
- `NSLocationWhenInUseUsageDescription` (iOS)

### **나침반 부정확**

기기 교정 필요:
1. 설정 → 나침반 앱 실행
2. 기기를 8자로 움직여 교정
3. 재시행

---

## 🧪 **테스트**

### **Unit 테스트**

```bash
flutter test test/location_ar_converter_test.dart
```

### **실제 기기 테스트 체크리스트**

- [ ] ARCore/ARKit 지원 확인
- [ ] 카메라 권한 정상 작동
- [ ] GPS 위치 정확도 (±10m)
- [ ] 나침반 방향 정확도 (±5도)
- [ ] AR 마커 위치 정확도
- [ ] 60fps 성능 유지
- [ ] 배터리 소모 (1시간 < 30%)

---

## 📈 **성능 최적화**

### **1. LOD (Level of Detail)**

```dart
// 거리별 크기 조절
final scale = LocationARConverter.getScaleForDistance(distance);
```

### **2. Viewport Culling**

```dart
// 시야각 밖 마커 제거
if (!LocationARConverter.isInViewport(position)) {
  continue; // Skip
}
```

### **3. Update Throttling**

```dart
// 나침반 업데이트 제한 (1도 이상 변화시)
if ((_heading - heading).abs() > 1.0) {
  _heading = heading;
  onHeadingChanged(_heading);
}
```

---

## 🔒 **보안 고려사항**

### **위치 프라이버시**
- 위치 정보는 기기 내에서만 처리
- 서버에는 익명화된 데이터만 전송
- 사용자 동의 필수

### **카메라 프라이버시**
- 카메라 피드는 AR 처리에만 사용
- 저장하지 않음
- 사용자 통제 가능 (ON/OFF 토글)

---

## 📚 **참고 자료**

- [ARCore 공식 문서](https://developers.google.com/ar)
- [ARKit 공식 문서](https://developer.apple.com/arkit/)
- [Flutter ARCore Plugin](https://pub.dev/packages/arcore_flutter_plugin)
- [Flutter ARKit Plugin](https://pub.dev/packages/arkit_plugin)
- [Sensors Plus Plugin](https://pub.dev/packages/sensors_plus)

---

## 🎉 **완료!**

실제 AR 기능이 통합되었습니다!

### **다음 단계**:
1. 실제 기기에서 테스트
2. 전단지 API 연동
3. 사용자 피드백 수집
4. 성능 모니터링 설정

---

**작성일**: 2026-01-04  
**상태**: AR 통합 완료 ✅  
**테스트**: 실제 기기 필요
