# AR 기능 실제 구현 가이드

## 📱 **ARCore (Android) & ARKit (iOS) 통합**

### **1. 의존성 추가**

Flutter에서 AR을 구현하려면 다음 패키지를 추가해야 합니다:

```yaml
# pubspec.yaml
dependencies:
  arcore_flutter_plugin: ^0.1.0  # Android ARCore
  arkit_plugin: ^1.0.6           # iOS ARKit
  camera: ^0.10.5                # 카메라 접근
  permission_handler: ^11.1.0     # 권한 관리
  sensors_plus: ^4.0.2           # 센서 (나침반, 자이로)
```

---

## **2. 플랫폼별 설정**

### **Android (ARCore)**

#### **android/app/build.gradle**
```gradle
dependencies {
    implementation 'com.google.ar:core:1.39.0'
}

android {
    compileSdkVersion 33
    minSdkVersion 24  // ARCore requires min SDK 24
}
```

#### **android/app/src/main/AndroidManifest.xml**
```xml
<manifest>
    <!-- ARCore 필수 권한 -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera.ar" android:required="true" />
    
    <application>
        <!-- ARCore 메타데이터 -->
        <meta-data
            android:name="com.google.ar.core"
            android:value="required" />
    </application>
</manifest>
```

### **iOS (ARKit)**

#### **ios/Podfile**
```ruby
platform :ios, '12.0'  # ARKit requires iOS 12+
```

#### **ios/Runner/Info.plist**
```xml
<dict>
    <!-- 카메라 사용 권한 -->
    <key>NSCameraUsageDescription</key>
    <string>AR 전단지를 보려면 카메라 권한이 필요합니다</string>
    
    <!-- 위치 권한 (선택) -->
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>주변 매장을 찾기 위해 위치 정보가 필요합니다</string>
</dict>
```

---

## **3. AR View 구현**

### **3.1 ARCore View (Android)**

```dart
import 'package:arcore_flutter_plugin/arcore_flutter_plugin.dart';

class AndroidARView extends StatefulWidget {
  @override
  _AndroidARViewState createState() => _AndroidARViewState();
}

class _AndroidARViewState extends State<AndroidARView> {
  ArCoreController? arCoreController;

  @override
  Widget build(BuildContext context) {
    return ArCoreView(
      onArCoreViewCreated: _onArCoreViewCreated,
      enableTapRecognizer: true,
    );
  }

  void _onArCoreViewCreated(ArCoreController controller) {
    arCoreController = controller;
    
    // AR 노드 추가 (3D 마커)
    _addARNodes();
  }

  void _addARNodes() {
    final material = ArCoreMaterial(
      color: Color.fromARGB(255, 245, 166, 35),
      metallic: 1.0,
    );
    
    final sphere = ArCoreSphere(
      materials: [material],
      radius: 0.1,
    );
    
    final node = ArCoreNode(
      shape: sphere,
      position: Vector3(0, 0, -1.5),  // 1.5m 앞
    );
    
    arCoreController?.addArCoreNode(node);
  }

  @override
  void dispose() {
    arCoreController?.dispose();
    super.dispose();
  }
}
```

### **3.2 ARKit View (iOS)**

```dart
import 'package:arkit_plugin/arkit_plugin.dart';

class IOSARView extends StatefulWidget {
  @override
  _IOSARViewState createState() => _IOSARViewState();
}

class _IOSARViewState extends State<IOSARView> {
  ARKitController? arkitController;

  @override
  Widget build(BuildContext context) {
    return ARKitSceneView(
      onARKitViewCreated: _onARKitViewCreated,
      enableTapRecognizer: true,
    );
  }

  void _onARKitViewCreated(ARKitController controller) {
    arkitController = controller;
    
    // AR 노드 추가
    _addARNodes();
  }

  void _addARNodes() {
    final node = ARKitNode(
      geometry: ARKitSphere(radius: 0.1),
      position: Vector3(0, 0, -1.5),
      eulerAngles: Vector3.zero(),
    );
    
    arkitController?.add(node);
  }

  @override
  void dispose() {
    arkitController?.dispose();
    super.dispose();
  }
}
```

---

## **4. 플랫폼 감지 및 통합**

### **ar_view_wrapper.dart**
```dart
import 'dart:io';
import 'package:flutter/material.dart';

class ARViewWrapper extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    if (Platform.isAndroid) {
      return AndroidARView();
    } else if (Platform.isIOS) {
      return IOSARView();
    } else {
      return Center(
        child: Text('AR은 모바일 기기에서만 지원됩니다'),
      );
    }
  }
}
```

---

## **5. 위치 기반 AR 마커**

### **5.1 GPS 좌표를 AR 좌표로 변환**

```dart
import 'package:vector_math/vector_math_64.dart' as vector;
import 'dart:math' as math;

class LocationARConverter {
  // 현재 위치와 대상 위치를 AR 좌표로 변환
  static vector.Vector3 gpsToARPosition({
    required double currentLat,
    required double currentLng,
    required double targetLat,
    required double targetLng,
    required double bearing,  // 나침반 방향 (0-360도)
  }) {
    // 거리 계산 (미터)
    final distance = _calculateDistance(
      currentLat, currentLng,
      targetLat, targetLng,
    );
    
    // 방위각 계산
    final targetBearing = _calculateBearing(
      currentLat, currentLng,
      targetLat, targetLng,
    );
    
    // 상대 각도 (현재 방향 기준)
    final relativeAngle = (targetBearing - bearing + 360) % 360;
    final angleRad = relativeAngle * math.pi / 180;
    
    // AR 좌표 (x, y, z)
    final x = distance * math.sin(angleRad);
    final z = -distance * math.cos(angleRad);  // AR에서 -Z가 앞
    final y = 0.0;  // 높이 (필요시 조정)
    
    return vector.Vector3(x, y, z);
  }
  
  static double _calculateDistance(
    double lat1, double lng1,
    double lat2, double lng2,
  ) {
    const r = 6371000; // 지구 반지름 (미터)
    final dLat = (lat2 - lat1) * math.pi / 180;
    final dLng = (lng2 - lng1) * math.pi / 180;
    
    final a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(lat1 * math.pi / 180) *
        math.cos(lat2 * math.pi / 180) *
        math.sin(dLng / 2) * math.sin(dLng / 2);
    
    final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    return r * c;
  }
  
  static double _calculateBearing(
    double lat1, double lng1,
    double lat2, double lng2,
  ) {
    final dLng = (lng2 - lng1) * math.pi / 180;
    final lat1Rad = lat1 * math.pi / 180;
    final lat2Rad = lat2 * math.pi / 180;
    
    final y = math.sin(dLng) * math.cos(lat2Rad);
    final x = math.cos(lat1Rad) * math.sin(lat2Rad) -
        math.sin(lat1Rad) * math.cos(lat2Rad) * math.cos(dLng);
    
    final bearing = math.atan2(y, x) * 180 / math.pi;
    return (bearing + 360) % 360;
  }
}
```

### **5.2 센서 데이터 통합 (나침반)**

```dart
import 'package:sensors_plus/sensors_plus.dart';
import 'dart:async';

class CompassService {
  StreamSubscription? _magnetometerSubscription;
  double _heading = 0.0;
  
  void start(Function(double) onHeadingChanged) {
    _magnetometerSubscription = magnetometerEvents.listen((event) {
      // 나침반 방향 계산
      _heading = _calculateHeading(event.x, event.y);
      onHeadingChanged(_heading);
    });
  }
  
  double _calculateHeading(double x, double y) {
    double heading = math.atan2(y, x) * 180 / math.pi;
    if (heading < 0) heading += 360;
    return heading;
  }
  
  void stop() {
    _magnetometerSubscription?.cancel();
  }
}
```

---

## **6. 실제 struct AR Flyer Viewer 통합**

### **ar_flyer_viewer_screen.dart (실제 AR)**

```dart
class _ARFlyerViewerScreenState extends ConsumerState<ARFlyerViewerScreen> {
  ARController? _arController;
  Location? _currentLocation;
  double _heading = 0.0;
  final _compassService = CompassService();
  
  @override
  void initState() {
    super.initState();
    _requestPermissions();
    _compassService.start((heading) {
      setState(() => _heading = heading);
    });
  }
  
  Future<void> _requestPermissions() async {
    await Permission.camera.request();
    await Permission.location.request();
  }
  
  void _onARViewCreated(dynamic controller) {
    _arController = controller;
    _addFlyerMarkers();
  }
  
  void _addFlyerMarkers() async {
    _currentLocation = await _getCurrentLocation();
    
    for (var flyer in _arFlyers) {
      final position = LocationARConverter.gpsToARPosition(
        currentLat: _currentLocation!.latitude,
        currentLng: _currentLocation!.longitude,
        targetLat: flyer['lat'],
        targetLng: flyer['lng'],
        bearing: _heading,
      );
      
      // AR 노드 추가
      _addARNode(position, flyer);
    }
  }
  
  @override
  void dispose() {
    _compassService.stop();
    _arController?.dispose();
    super.dispose();
  }
}
```

---

## **7. 성능 최적화**

### **7.1 AR 노드 필터링**
```dart
// 100m 이내 및 시야각 내 마커만 표시
bool _isInViewport(Vector3 position) {
  final distance = position.length;
  if (distance > 100) return false;  // 100m 제한
  
  // 시야각 체크 (-90도 ~ 90도)
  final angle = math.atan2(position.x, -position.z) * 180 / math.pi;
  return angle.abs() < 90;
}
```

### **7.2 LOD (Level of Detail)**
```dart
// 거리에 따른 마커 크기 조절
double _getScaleForDistance(double distance) {
  if (distance < 20) return 0.3;
  if (distance < 50) return 0.2;
  return 0.1;
}
```

---

## **8. 테스트**

### **디바이스 요구사항**
- **Android**: ARCore 지원 기기 (Android 7.0+)
- **iOS**: ARKit 지원 기기 (iPhone 6s+, iOS 12+)

### **테스트 체크리스트**
- [ ] 카메라 권한 정상 작동
- [ ] GPS 위치 정확도
- [ ] 나침반 방향 정확도
- [ ] AR 마커 위치 정확도
- [ ] 60fps 성능 유지
- [ ] 배터리 소모 최적화

---

## **9. 배포**

### **ARCore APK 분할 (Android)**
```gradle
// android/app/build.gradle
android {
    bundle {
        language {
            enableSplit = false
        }
        density {
            enableSplit = true
        }
        abi {
            enableSplit = true
        }
    }
}
```

---

## **10. 대안 (Web/Desktop)**

AR이 지원되지 않는 플랫폼에서는 **2D 지도 뷰**로 대체:

```dart
Widget build(BuildContext context) {
  if (Platform.isAndroid || Platform.isIOS) {
    return ARView();
  } else {
    return MapView();  // Google Maps 2D 뷰
  }
}
```

---

## **📚 참고 자료**

- [ARCore 공식 문서](https://developers.google.com/ar)
- [ARKit 공식 문서](https://developer.apple.com/arkit/)
- [Flutter ARCore Plugin](https://pub.dev/packages/arcore_flutter_plugin)
- [Flutter ARKit Plugin](https://pub.dev/packages/arkit_plugin)
- [Sensors Plus Plugin](https://pub.dev/packages/sensors_plus)

---

**작성일**: 2026-01-04  
**상태**: 시뮬레이션 구현 완료, 실제 AR 통합 가이드 제공
