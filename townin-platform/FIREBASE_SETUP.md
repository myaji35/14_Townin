# Firebase Cloud Messaging 설정 가이드

## 작업 3 완료 상태

### ✅ 완료된 작업
1. Firebase 패키지 추가 (pubspec.yaml)
   - firebase_core: ^2.24.2
   - firebase_messaging: ^14.7.10
   - flutter_local_notifications: ^16.3.0

2. NotificationService 생성 (`lib/core/services/notification_service.dart`)
   - FCM 초기화
   - 권한 요청
   - 토큰 관리
   - Foreground/Background 메시지 핸들러
   - 로컬 알림 표시

3. main.dart 업데이트
   - Firebase 초기화
   - NotificationService 초기화
   - Background 메시지 핸들러 등록

4. 백엔드 API 생성
   - `PUT /api/v1/users/fcm-token` - FCM 토큰 저장
   - `DELETE /api/v1/users/fcm-token` - FCM 토큰 삭제
   - User 엔티티에 fcmToken 필드 추가

---

## Firebase 프로젝트 설정 (필수)

FCM을 사용하려면 Firebase 프로젝트를 생성하고 설정 파일을 추가해야 합니다.

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: `townin-platform` (또는 원하는 이름)
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

### 2. Android 앱 등록

1. Firebase 프로젝트 설정 → "앱 추가" → Android 선택
2. Android 패키지 이름: `com.townin.app` (또는 원하는 패키지명)
3. 앱 닉네임: `Townin Android`
4. SHA-1 서명 인증서 (선택사항, 나중에 추가 가능)
5. `google-services.json` 파일 다운로드
6. **중요**: 파일을 `frontend/android/app/` 폴더에 저장

### 3. iOS 앱 등록

1. Firebase 프로젝트 설정 → "앱 추가" → iOS 선택
2. iOS 번들 ID: `com.townin.app` (또는 원하는 번들 ID)
3. 앱 닉네임: `Townin iOS`
4. `GoogleService-Info.plist` 파일 다운로드
5. **중요**: 파일을 `frontend/ios/Runner/` 폴더에 저장

---

## 플랫폼별 설정

### Android 설정

현재 Flutter 프로젝트에는 Android 폴더가 생성되지 않았습니다.
다음 명령어로 플랫폼 폴더를 생성하세요:

```bash
cd frontend
flutter create --platforms=android,ios .
```

그 다음 아래 파일들을 수정하세요:

#### 1. `android/build.gradle`

```gradle
buildscript {
    dependencies {
        // Add this line
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

#### 2. `android/app/build.gradle`

파일 맨 아래에 추가:

```gradle
apply plugin: 'com.google.gms.google-services'
```

#### 3. `android/app/src/main/AndroidManifest.xml`

`<application>` 태그 안에 추가:

```xml
<application>
    <!-- Existing content -->

    <!-- FCM Default Channel -->
    <meta-data
        android:name="com.google.firebase.messaging.default_notification_channel_id"
        android:value="townin_channel" />

    <!-- FCM Service -->
    <service
        android:name="io.flutter.plugins.firebase.messaging.FlutterFirebaseMessagingService"
        android:exported="false">
        <intent-filter>
            <action android:name="com.google.firebase.MESSAGING_EVENT" />
        </intent-filter>
    </service>
</application>
```

#### 4. `android/app/google-services.json`

Firebase Console에서 다운로드한 파일을 이 위치에 저장하세요.

---

### iOS 설정

#### 1. `ios/Runner/GoogleService-Info.plist`

Firebase Console에서 다운로드한 파일을 이 위치에 저장하세요.

#### 2. `ios/Runner/AppDelegate.swift`

파일 전체를 다음과 같이 수정:

```swift
import UIKit
import Flutter
import Firebase

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    FirebaseApp.configure()

    if #available(iOS 10.0, *) {
      UNUserNotificationCenter.current().delegate = self as? UNUserNotificationCenterDelegate
    }

    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
```

#### 3. `ios/Podfile`

파일 맨 위에 추가:

```ruby
platform :ios, '13.0'
```

#### 4. Capabilities 설정

Xcode에서:
1. `ios/Runner.xcworkspace` 열기
2. Runner 프로젝트 선택
3. "Signing & Capabilities" 탭
4. "+ Capability" 클릭
5. "Push Notifications" 추가
6. "Background Modes" 추가
   - "Remote notifications" 체크

---

## FCM 토큰 전송 흐름

### 1. 로그인 후 토큰 전송

사용자가 로그인한 후 FCM 토큰을 백엔드에 전송해야 합니다.

`frontend/lib/features/auth/presentation/login_screen.dart` 또는 로그인 완료 후:

```dart
import '../../core/services/notification_service.dart';

// 로그인 성공 후
final authToken = loginResponse['accessToken'];
await NotificationService().sendTokenToBackend(authToken);
```

### 2. 토큰 갱신 처리

`NotificationService`는 이미 토큰 갱신을 감지하도록 구현되어 있습니다:

```dart
_firebaseMessaging.onTokenRefresh.listen((newToken) {
  _fcmToken = newToken;
  print('FCM Token refreshed: $newToken');
  // TODO: 여기에 sendTokenToBackend 호출 추가
});
```

---

## 백엔드에서 푸시 알림 보내기

### API 엔드포인트

```
PUT    /api/v1/users/fcm-token    - FCM 토큰 저장
DELETE /api/v1/users/fcm-token    - FCM 토큰 삭제
```

### FCM 토큰 저장 예시

```bash
curl -X PUT http://localhost:3000/api/v1/users/fcm-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fcmToken": "FCM_TOKEN_HERE"}'
```

### 푸시 알림 보내기 (Node.js + Firebase Admin SDK)

백엔드에서 Firebase Admin SDK를 사용하여 알림을 보낼 수 있습니다:

```typescript
import * as admin from 'firebase-admin';

// Firebase Admin 초기화 (app.module.ts 또는 main.ts)
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: 'your-project-id',
    clientEmail: 'your-client-email',
    privateKey: 'your-private-key',
  }),
});

// 알림 보내기
async function sendNotification(fcmToken: string, title: string, body: string) {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    data: {
      type: 'flyer',
      flyerId: '123',
    },
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}
```

---

## 테스트 방법

### 1. Firebase Console에서 테스트

1. Firebase Console → Cloud Messaging
2. "새 알림" 클릭
3. 알림 제목, 내용 입력
4. "테스트 메시지 보내기"
5. FCM 토큰 입력 (앱 콘솔 로그에서 확인)
6. "테스트" 클릭

### 2. Flutter 앱에서 FCM 토큰 확인

```dart
// NotificationService에서 이미 로그 출력 중
print('FCM Token: $_fcmToken');
```

앱 실행 후 콘솔에서 FCM 토큰을 복사하여 Firebase Console에서 테스트하세요.

---

## 알림 채널 설정 (Android)

`NotificationService`에 이미 설정되어 있습니다:

```dart
const AndroidNotificationDetails androidDetails =
    AndroidNotificationDetails(
  'townin_channel',           // 채널 ID
  'Townin Notifications',     // 채널 이름
  channelDescription: 'Notifications from Townin app',
  importance: Importance.high,
  priority: Priority.high,
  showWhen: true,
);
```

---

## 주의사항

1. **Firebase 프로젝트**: 반드시 Firebase 프로젝트를 생성하고 `google-services.json`과 `GoogleService-Info.plist` 파일을 추가해야 합니다.

2. **플랫폼 폴더**: 현재 프로젝트에는 `android`와 `ios` 폴더가 없으므로 `flutter create --platforms=android,ios .` 명령어로 생성하세요.

3. **권한**: iOS는 사용자 권한이 필수이며, Android는 API 33+ 부터 런타임 권한이 필요합니다.

4. **APNs 인증서**: iOS 푸시 알림을 위해서는 Apple Developer Console에서 APNs 인증서를 생성하고 Firebase에 업로드해야 합니다.

5. **디버그 모드**: 개발 중에는 `print()` 로그를 확인하여 FCM 토큰과 알림 수신을 모니터링하세요.

---

## 다음 단계

Task 3 (Firebase Cloud Messaging)이 완료되었습니다!

다음은 **Task 4: 오프라인 모드 구현**입니다:
- sqflite 패키지 추가
- 로컬 데이터베이스 스키마 생성
- 캐싱 로직 구현
- 동기화 메커니즘

---

## 참고 자료

- [FlutterFire 공식 문서](https://firebase.flutter.dev/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [flutter_local_notifications](https://pub.dev/packages/flutter_local_notifications)
- [Firebase Admin SDK for Node.js](https://firebase.google.com/docs/admin/setup)
