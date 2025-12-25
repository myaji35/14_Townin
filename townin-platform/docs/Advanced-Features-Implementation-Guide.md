# Townin Platform - 고급 기능 구현 가이드

최종 업데이트: 2025-02-01

---

## 🎯 구현 완료 기능

### ✅ Phase 1: 사용자 Engagement 기능

#### 1. 찜하기 (Favorites) ✅

**Backend API** (완료):
- `POST /api/v1/favorites/:flyerId` - 찜하기 추가
- `DELETE /api/v1/favorites/:flyerId` - 찜하기 제거
- `GET /api/v1/favorites` - 찜한 전단지 목록
- `GET /api/v1/favorites/check/:flyerId` - 찜 여부 확인
- `GET /api/v1/favorites/ids` - 찜한 전단지 ID 목록

**Database**:
```sql
CREATE TABLE favorite_flyers (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  flyer_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, flyer_id)
);

CREATE INDEX idx_favorites_user ON favorite_flyers(user_id);
CREATE INDEX idx_favorites_flyer ON favorite_flyers(flyer_id);
```

**Flutter 구현** (TODO):

1. **Favorite API Service**:
```dart
// lib/features/favorites/data/favorite_api_service.dart
class FavoriteApiService {
  Future<void> addFavorite(String flyerId);
  Future<void> removeFavorite(String flyerId);
  Future<FlyerListResponse> getFavorites({int page, int limit});
  Future<bool> isFavorited(String flyerId);
  Future<List<String>> getFavoriteIds();
}
```

2. **Favorite BLoC**:
```dart
// lib/features/favorites/bloc/favorite_bloc.dart
class FavoriteBloc extends Bloc<FavoriteEvent, FavoriteState> {
  // Events
  - ToggleFavorite(flyerId)
  - LoadFavorites
  - LoadFavoriteIds

  // States
  - FavoriteInitial
  - FavoriteLoading
  - FavoriteLoaded(List<String> favoriteIds)
  - FavoriteError
}
```

3. **UI Integration**:
```dart
// FlyerCard에 하트 버튼 추가
IconButton(
  icon: Icon(
    isFavorited ? Icons.favorite : Icons.favorite_border,
    color: isFavorited ? Colors.red : Colors.grey,
  ),
  onPressed: () {
    context.read<FavoriteBloc>().add(
      ToggleFavorite(flyer.id),
    );
  },
)

// 찜한 전단지 목록 화면
class FavoriteFlyersScreen extends StatelessWidget {
  // BLoC으로 찜한 전단지 목록 표시
}
```

**사용 예제**:
```bash
# 찜하기 추가
curl -X POST http://localhost:3000/api/v1/favorites/flyer-uuid \
  -H "Authorization: Bearer YOUR_TOKEN"

# 찜한 목록 조회
curl http://localhost:3000/api/v1/favorites \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### 2. 공유 (Share) 기능

**Flutter 구현** (TODO):

1. **패키지 추가** (`pubspec.yaml`):
```yaml
dependencies:
  share_plus: ^7.2.1
```

2. **Share Service**:
```dart
// lib/core/services/share_service.dart
import 'package:share_plus/share_plus.dart';

class ShareService {
  static Future<void> shareFlyer(FlyerModel flyer) async {
    final text = '''
${flyer.title}

${flyer.merchant?.businessName}에서 진행 중인 이벤트입니다!

Townin 앱에서 확인하기
https://townin.kr/flyers/${flyer.id}
    ''';

    await Share.share(
      text,
      subject: flyer.title,
    );
  }

  static Future<void> shareFlyerWithImage(FlyerModel flyer) async {
    // 이미지와 함께 공유
    await Share.shareXFiles(
      [XFile(flyer.imageUrl)],
      text: flyer.title,
    );
  }
}
```

3. **UI Integration**:
```dart
// FlyerDetailScreen에 공유 버튼 추가
IconButton(
  icon: Icon(Icons.share),
  onPressed: () async {
    await ShareService.shareFlyer(flyer);

    // Analytics 추적
    await _apiService.trackFlyerShare(flyer.id);
  },
)
```

**Backend Analytics** (추가 권장):
```typescript
// flyers.controller.ts
@Post(':id/share')
async trackShare(@Param('id') id: string, @Request() req) {
  const userId = req.user?.userId;
  await this.analyticsService.trackEvent({
    userId,
    eventType: 'flyer_share',
    eventCategory: 'engagement',
    metadata: { flyerId: id },
  });
  return { message: 'Share tracked' };
}
```

---

### Phase 2: 상인/관리자 기능

#### 3. 상인 전단지 관리 UI

**Flutter Screens** (TODO):

1. **상인 대시보드**:
```dart
// lib/features/merchant/presentation/merchant_dashboard_screen.dart
class MerchantDashboardScreen extends StatelessWidget {
  // 내 전단지 목록
  // 통계 (총 조회수, 클릭수)
  // 전단지 생성 버튼
}
```

2. **전단지 생성 화면**:
```dart
// lib/features/merchant/presentation/create_flyer_screen.dart
class CreateFlyerScreen extends StatefulWidget {
  // 이미지 업로드 (image_picker)
  // 제목, 설명 입력
  // 카테고리 선택
  // 타겟 반경 설정
  // 시작일/종료일 선택
}
```

3. **이미지 업로드 통합**:
```dart
import 'package:image_picker/image_picker.dart';

class ImageUploadWidget extends StatefulWidget {
  Future<void> pickImage() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.gallery);

    if (image != null) {
      // S3 Presigned URL로 업로드
      final presignedUrl = await fileApiService.getPresignedUploadUrl(
        fileName: image.name,
        contentType: 'image/jpeg',
      );

      await dio.put(presignedUrl, data: await image.readAsBytes());
    }
  }
}
```

4. **전단지 수정 화면**:
```dart
// lib/features/merchant/presentation/edit_flyer_screen.dart
class EditFlyerScreen extends StatefulWidget {
  // 기존 전단지 정보 로드
  // 수정 기능
  // 삭제 기능
}
```

**Backend API** (이미 완료):
- `GET /api/v1/flyers/merchant/:id`
- `POST /api/v1/flyers`
- `PUT /api/v1/flyers/:id`
- `DELETE /api/v1/flyers/:id`

---

#### 4. 관리자 대시보드 UI

**Flutter Screens** (TODO):

1. **승인 대기 전단지 목록**:
```dart
// lib/features/admin/presentation/pending_flyers_screen.dart
class PendingFlyersScreen extends StatelessWidget {
  // GET /api/v1/flyers/admin/pending
  // 승인 대기 전단지 카드 목록
  // 각 카드에 승인/거부 버튼
}
```

2. **전단지 검토 화면**:
```dart
// lib/features/admin/presentation/review_flyer_screen.dart
class ReviewFlyerScreen extends StatelessWidget {
  // 전단지 상세 정보
  // 상인 정보
  // 승인 버튼
  // 거부 버튼 (사유 입력)
}
```

3. **Admin BLoC**:
```dart
// lib/features/admin/bloc/admin_bloc.dart
class AdminBloc extends Bloc<AdminEvent, AdminState> {
  // Events
  - LoadPendingFlyers
  - ApproveFlyer(flyerId)
  - RejectFlyer(flyerId, reason)

  // States
  - AdminInitial
  - AdminLoading
  - PendingFlyersLoaded
  - FlyerApproved
  - FlyerRejected
}
```

**Backend API** (이미 완료):
- `GET /api/v1/flyers/admin/pending`
- `POST /api/v1/flyers/admin/:id/approve`
- `POST /api/v1/flyers/admin/:id/reject`
- `GET /api/v1/flyers/admin/status/:status`

---

### Phase 3: 고급 기능

#### 5. H3 Geospatial 정확도 개선

**Backend 구현** (TODO):

1. **PostgreSQL H3 Extension 설치**:
```sql
-- 설치 (macOS with Homebrew)
brew install h3

-- PostgreSQL extension 생성
CREATE EXTENSION IF NOT EXISTS h3;

-- H3 인덱스 컬럼 추가
ALTER TABLE merchants ADD COLUMN h3_index VARCHAR(15);
ALTER TABLE flyers ADD COLUMN h3_index VARCHAR(15);

-- 인덱스 생성
CREATE INDEX idx_merchants_h3 ON merchants(h3_index);
CREATE INDEX idx_flyers_h3 ON flyers(h3_index);
```

2. **H3 k-ring 쿼리 구현**:
```typescript
// flyers.service.ts
async getFlyersByLocationH3(
  h3Index: string,
  radiusKm: number = 1,
  page: number = 1,
  limit: number = 20,
): Promise<{ data: Flyer[]; total: number }> {
  // H3 resolution 9 기준 (약 0.1km)
  // radiusKm를 k값으로 변환
  const k = Math.ceil(radiusKm / 0.1);

  // k-ring으로 주변 hexagon 가져오기
  const nearbyHexagons = await this.connection.query(`
    SELECT h3_k_ring($1::h3index, $2) AS hex
  `, [h3Index, k]);

  const hexList = nearbyHexagons.map(r => r.hex);

  // 주변 hexagon에 있는 전단지 조회
  const [data, total] = await this.flyerRepository
    .createQueryBuilder('flyer')
    .leftJoinAndSelect('flyer.merchant', 'merchant')
    .where('merchant.h3_index = ANY(:hexList)', { hexList })
    .andWhere('flyer.status = :status', { status: 'approved' })
    .andWhere('flyer.is_active = true')
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  return { data, total };
}
```

3. **상인 등록 시 H3 인덱스 자동 생성**:
```typescript
// merchants.service.ts
async create(dto: CreateMerchantDto) {
  const h3Index = h3.geoToH3(
    dto.latitude,
    dto.longitude,
    9, // resolution
  );

  const merchant = this.merchantRepository.create({
    ...dto,
    h3Index,
  });

  return await this.merchantRepository.save(merchant);
}
```

**Flutter 구현** (TODO):

1. **사용자 위치 → H3 변환**:
```dart
// pubspec.yaml
dependencies:
  h3_dart: ^1.0.0  # H3 Dart 패키지

// lib/core/services/location_service.dart
import 'package:h3_dart/h3_dart.dart';
import 'package:geolocator/geolocator.dart';

class LocationService {
  static Future<String> getCurrentH3Index() async {
    final position = await Geolocator.getCurrentPosition();

    final h3Index = geoToH3(
      position.latitude,
      position.longitude,
      9, // resolution
    );

    return h3Index;
  }

  static Future<bool> requestLocationPermission() async {
    LocationPermission permission = await Geolocator.checkPermission();

    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    return permission == LocationPermission.always ||
           permission == LocationPermission.whileInUse;
  }
}
```

2. **위치 기반 전단지 로드**:
```dart
// 앱 시작 시
final hasPermission = await LocationService.requestLocationPermission();

if (hasPermission) {
  final h3Index = await LocationService.getCurrentH3Index();

  context.read<FlyerBloc>().add(
    LoadFlyersByLocation(h3Index: h3Index, radius: 2),
  );
}
```

---

#### 6. 지도 뷰 (Google Maps)

**Flutter 구현** (TODO):

1. **패키지 추가**:
```yaml
dependencies:
  google_maps_flutter: ^2.5.0
```

2. **Map Screen**:
```dart
// lib/features/map/presentation/flyer_map_screen.dart
import 'package:google_maps_flutter/google_maps_flutter.dart';

class FlyerMapScreen extends StatefulWidget {
  @override
  _FlyerMapScreenState createState() => _FlyerMapScreenState();
}

class _FlyerMapScreenState extends State<FlyerMapScreen> {
  GoogleMapController? _controller;
  Set<Marker> _markers = {};

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GoogleMap(
        initialCameraPosition: CameraPosition(
          target: LatLng(37.5665, 126.9780), // Seoul
          zoom: 14,
        ),
        markers: _markers,
        onMapCreated: (controller) {
          _controller = controller;
          _loadFlyersInView();
        },
        onCameraMove: (position) {
          // 지도 이동 시 전단지 다시 로드
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // 리스트 뷰로 전환
        },
        child: Icon(Icons.list),
      ),
    );
  }

  Future<void> _loadFlyersInView() async {
    // 현재 지도 범위 내 전단지 로드
    final bounds = await _controller!.getVisibleRegion();

    // TODO: 범위 기반 API 호출
    final flyers = await _flyerApiService.getFlyersByBounds(
      northEast: bounds.northeast,
      southWest: bounds.southwest,
    );

    // 마커 생성
    setState(() {
      _markers = flyers.map((flyer) {
        return Marker(
          markerId: MarkerId(flyer.id),
          position: LatLng(
            flyer.merchant!.latitude,
            flyer.merchant!.longitude,
          ),
          infoWindow: InfoWindow(
            title: flyer.title,
            snippet: flyer.merchant!.businessName,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => FlyerDetailScreen(flyerId: flyer.id),
                ),
              );
            },
          ),
        );
      }).toSet();
    });
  }
}
```

3. **지도/리스트 토글**:
```dart
enum ViewMode { list, map }

class FlyerViewScreen extends StatefulWidget {
  ViewMode _viewMode = ViewMode.list;

  Widget build(BuildContext context) {
    return _viewMode == ViewMode.list
        ? FlyerListScreen()
        : FlyerMapScreen();
  }
}
```

**Backend API** (추가 필요):
```typescript
// flyers.controller.ts
@Get('bounds')
@ApiOperation({ summary: 'Get flyers by map bounds' })
async getFlyersByBounds(
  @Query('neLat') neLat: number,
  @Query('neLng') neLng: number,
  @Query('swLat') swLat: number,
  @Query('swLng') swLng: number,
) {
  return await this.flyersService.getFlyersByBounds({
    northEast: { lat: neLat, lng: neLng },
    southWest: { lat: swLat, lng: swLng },
  });
}
```

---

#### 7. Push Notification 활성화

**Backend 구현** (TODO):

1. **Firebase Admin 패키지 설치**:
```bash
npm install firebase-admin
```

2. **Firebase 초기화**:
```typescript
// src/modules/notifications/notifications.service.ts
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService implements OnModuleInit {
  onModuleInit() {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FCM_PROJECT_ID,
        privateKey: process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FCM_CLIENT_EMAIL,
      }),
    });
  }

  async sendPushNotification(
    token: string,
    notification: { title: string; body: string; data?: any },
  ) {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      token,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}
```

3. **전단지 승인 시 알림**:
```typescript
// flyers.service.ts
async approveFlyer(flyerId: string, adminId: string) {
  // ... approval logic

  // 상인에게 푸시 알림
  const deviceTokens = await this.deviceTokenRepository.find({
    where: { userId: flyer.merchantId },
  });

  for (const device of deviceTokens) {
    await this.notificationsService.sendPushNotification(
      device.token,
      {
        title: '전단지 승인 완료',
        body: `"${flyer.title}" 전단지가 승인되었습니다.`,
        data: { flyerId: flyer.id, type: 'flyer_approved' },
      },
    );
  }
}
```

**Flutter 구현** (TODO):

1. **Firebase Messaging 설정**:
```dart
// lib/main.dart
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp();

  // 백그라운드 메시지 핸들러
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  runApp(MyApp());
}

Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  print('Handling background message: ${message.messageId}');
}
```

2. **디바이스 토큰 등록**:
```dart
// lib/core/services/notification_service.dart
class NotificationService {
  static Future<void> initialize() async {
    final messaging = FirebaseMessaging.instance;

    // 권한 요청
    await messaging.requestPermission();

    // 토큰 가져오기
    final token = await messaging.getToken();

    if (token != null) {
      // Backend에 등록
      await dio.post('/api/v1/notifications/device-tokens', data: {
        'token': token,
        'platform': Platform.isIOS ? 'ios' : 'android',
      });
    }

    // Foreground 메시지 핸들러
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('Got a message whilst in the foreground!');
      print('Message data: ${message.data}');

      if (message.notification != null) {
        // 로컬 알림 표시
        _showLocalNotification(message.notification!);
      }
    });

    // 알림 탭 핸들러
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      print('Message clicked!');

      // 전단지 상세 화면으로 이동
      if (message.data['flyerId'] != null) {
        navigatorKey.currentState?.push(
          MaterialPageRoute(
            builder: (_) => FlyerDetailScreen(
              flyerId: message.data['flyerId'],
            ),
          ),
        );
      }
    });
  }
}
```

---

## 📊 구현 완성도

| 기능 | Backend | Flutter | 완성도 |
|------|---------|---------|--------|
| **찜하기** | ✅ 100% | ⏳ TODO | 50% |
| **공유** | ⏳ Analytics | ⏳ TODO | 0% |
| **상인 UI** | ✅ 100% | ⏳ TODO | 50% |
| **관리자 UI** | ✅ 100% | ⏳ TODO | 50% |
| **H3 Geospatial** | ⏳ TODO | ⏳ TODO | 0% |
| **지도 뷰** | ⏳ TODO | ⏳ TODO | 0% |
| **Push 알림** | 🔧 준비됨 | ⏳ TODO | 30% |

---

## 🚀 빠른 시작

### 1. 찜하기 기능 테스트

```bash
# 찜하기 추가
curl -X POST http://localhost:3000/api/v1/favorites/flyer-test-uuid-001 \
  -H "Authorization: Bearer YOUR_TOKEN"

# 찜한 목록
curl http://localhost:3000/api/v1/favorites \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. 관리자 승인 테스트

```bash
# 승인 대기 목록
curl http://localhost:3000/api/v1/flyers/admin/pending \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 승인
curl -X POST http://localhost:3000/api/v1/flyers/admin/flyer-test-uuid-004/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 📚 다음 단계

### 우선순위 1: Flutter UI 완성
1. Favorites UI (찜하기 버튼, 목록 화면)
2. Share UI (공유 버튼)
3. 상인 대시보드 (전단지 관리)
4. 관리자 승인 UI

### 우선순위 2: 고급 기능
5. H3 Geospatial 개선
6. 지도 뷰
7. Push Notification 활성화

### 우선순위 3: 프로덕션 준비
8. 오프라인 지원
9. 이미지 캐싱
10. AI 전단지 스캔

---

**작성일**: 2025-02-01
**상태**: Backend ✅ 완료 / Flutter ⏳ TODO
