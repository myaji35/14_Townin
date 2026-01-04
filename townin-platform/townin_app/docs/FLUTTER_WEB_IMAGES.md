# Flutter Web 이미지 로딩 가이드

## 문제 상황

Flutter Web에서 이미지를 표시할 때 다음과 같은 문제들이 발생할 수 있습니다:
- Asset 이미지가 빌드에 포함되지 않음
- 네트워크 이미지가 CORS 문제로 로드되지 않음
- 이미지 로딩 실패 시 빈 화면 또는 에러

---

## ✅ 권장 해결책: Image.network + Fallback

### 1. 외부 이미지 URL 사용 (Unsplash, CDN 등)

```dart
Image.network(
  'https://images.unsplash.com/photo-...',
  width: double.infinity,
  height: 160,
  fit: BoxFit.cover,
  // 이미지 로드 실패 시 대체 UI
  errorBuilder: (context, error, stackTrace) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF4CAF50), Color(0xFF66BB6A)],
        ),
      ),
      child: Icon(Icons.image, size: 48, color: Colors.white70),
    );
  },
  // 로딩 중 표시
  loadingBuilder: (context, child, loadingProgress) {
    if (loadingProgress == null) return child;
    return Center(
      child: CircularProgressIndicator(
        value: loadingProgress.expectedTotalBytes != null
            ? loadingProgress.cumulativeBytesLoaded /
                loadingProgress.expectedTotalBytes!
            : null,
      ),
    );
  },
)
```

---

## ❌ 피해야 할 실수들

### 1. Asset 이미지를 Web에서 사용

**문제**:
```dart
Image.asset('assets/images/photo.png')  // ❌ Web에서 경로 찾기 어려움
```

**이유**:
- Flutter Web은 asset 경로를 다르게 처리
- `build/web/assets/assets/images/...` 같은 중첩 경로 생성
- 런타임에 경로 불일치로 로드 실패

**해결**:
```dart
// pubspec.yaml에서 개별 파일 명시해도 Web에서는 불안정
// → 외부 URL 사용 권장
```

---

### 2. CachedNetworkImage만 믿기

**문제**:
```dart
CachedNetworkImage(
  imageUrl: url,
  placeholder: (context, url) => CircularProgressIndicator(),
  errorWidget: (context, url, error) => Icon(Icons.error),
)
```

**이유**:
- 패키지 의존성 추가
- Web에서 캐싱이 제대로 작동하지 않을 수 있음
- `Image.network`가 기본 제공하는 기능으로 충분

**권장**:
```dart
// 기본 Image.network + errorBuilder + loadingBuilder 조합 사용
```

---

### 3. CORS 문제 과도하게 걱정

**오해**:
- "모든 외부 이미지가 CORS 문제를 일으킬 것이다"

**실제**:
- Unsplash, Imgur 등 대부분의 공개 이미지 CDN은 CORS 허용
- `Access-Control-Allow-Origin: *` 헤더 제공
- 먼저 시도해보고 문제 발생 시 대응

**확인 방법**:
```bash
curl -I https://images.unsplash.com/photo-xxx
# Access-Control-Allow-Origin: * 확인
```

---

## 📚 베스트 프랙티스

### Mock 데이터 구조

```dart
static final flyers = [
  {
    'id': '1',
    'title': '제목',
    'category': 'food',  // 중요: Fallback UI를 위한 카테고리
    'imageUrl': 'https://images.unsplash.com/photo-...',  // 외부 URL
    // ...
  },
];
```

### 카테고리별 Fallback 색상

```dart
List<Color> _getCategoryGradient(String? category) {
  switch (category) {
    case 'food':
      return [Color(0xFF4CAF50), Color(0xFF66BB6A)]; // Green
    case 'wellness':
      return [Color(0xFF9C27B0), Color(0xFFBA68C8)]; // Purple
    case 'cafe':
      return [Color(0xFF795548), Color(0xFFA1887F)]; // Brown
    default:
      return [Color(0xFFF5A623), Color(0xFFFFB74D)]; // Gold
  }
}

IconData _getCategoryIcon(String? category) {
  switch (category) {
    case 'food': return Icons.restaurant;
    case 'wellness': return Icons.spa;
    case 'cafe': return Icons.local_cafe;
    default: return Icons.local_offer;
  }
}
```

---

## 🔍 디버깅 체크리스트

이미지가 안 보일 때:

1. **Network 탭 확인** (F12 → Network)
   - [ ] 이미지 요청이 시도되었는가?
   - [ ] HTTP 상태 코드는? (200 OK인가?)
   - [ ] CORS 에러가 있는가?

2. **Console 확인** (F12 → Console)
   - [ ] CORS 에러 메시지?
   - [ ] 404 Not Found?
   - [ ] 다른 JavaScript 에러?

3. **코드 확인**
   - [ ] `errorBuilder`가 구현되어 있는가?
   - [ ] `loadingBuilder`가 구현되어 있는가?
   - [ ] imageUrl이 null이 아닌가?

4. **빌드 확인** (Asset 사용 시)
   - [ ] `flutter clean` 실행했는가?
   - [ ] `build/web/assets/` 디렉토리에 이미지가 있는가?

---

## 🎯 요약

| 방법 | 장점 | 단점 | 권장도 |
|------|------|------|--------|
| **Image.network + Fallback** | 간단, 안정적, CORS 문제 적음 | 네트워크 필요 | ⭐⭐⭐⭐⭐ |
| CachedNetworkImage | 캐싱 지원 | 패키지 의존성, Web 불안정 | ⭐⭐⭐ |
| Image.asset | 번들 포함, 빠름 | Web 경로 문제 | ⭐⭐ |
| Base64 inline | 항상 작동 | 파일 크기 증가 | ⭐ |

---

## 📝 참고 자료

- [Flutter Web 이미지 가이드](https://docs.flutter.dev/platform-integration/web/renderers#images)
- [Image.network API](https://api.flutter.dev/flutter/widgets/Image/Image.network.html)
- [Unsplash CORS 정책](https://unsplash.com/documentation)

---

**작성일**: 2025-12-31  
**작성자**: Development Team  
**마지막 업데이트**: Flutter Web 이미지 로딩 이슈 해결 (Unsplash URL + errorBuilder 사용)
