# File Upload Guide

Townin 플랫폼의 파일 업로드 API 사용 가이드입니다.

## 목차
- [개요](#개요)
- [업로드 방식](#업로드-방식)
- [Direct Upload (서버 경유)](#direct-upload-서버-경유)
- [Presigned URL (클라이언트 직접 업로드)](#presigned-url-클라이언트-직접-업로드)
- [이미지 Variants](#이미지-variants)
- [에러 처리](#에러-처리)

---

## 개요

Townin은 두 가지 파일 업로드 방식을 지원합니다:

1. **Direct Upload**: 서버를 거쳐 S3에 업로드 (간단, 작은 파일)
2. **Presigned URL**: 클라이언트가 직접 S3에 업로드 (빠름, 대용량 파일)

### 파일 제한
- **최대 크기**: 10MB
- **허용 MIME Type**: `image/jpeg`, `image/png`, `image/webp`
- **Entity Types**: `user_profile`, `flyer`, `merchant_logo`, `merchant_photo`

---

## Direct Upload (서버 경유)

서버를 통해 파일을 업로드하는 방식입니다.

### API Endpoint
```
POST /api/files/upload
```

### Request (Multipart Form Data)
```typescript
const formData = new FormData();
formData.append('file', fileBlob, 'profile.jpg');
formData.append('entityType', 'user_profile');
formData.append('entityId', 'user-uuid'); // Optional

const response = await fetch('http://localhost:3000/api/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
  body: formData,
});

const data = await response.json();
```

### Response (201 Created)
```json
{
  "id": "file-uuid",
  "url": "https://cdn.townin.kr/user_profile/2025/02/uuid/profile.jpg",
  "key": "user_profile/2025/02/uuid/profile.jpg",
  "size": 2048576,
  "mimeType": "image/jpeg",
  "createdAt": "2025-02-01T10:00:00Z"
}
```

### Flutter Example
```dart
import 'package:dio/dio.dart';

Future<Map<String, dynamic>> uploadFile(File file, String accessToken) async {
  final dio = Dio();

  final formData = FormData.fromMap({
    'file': await MultipartFile.fromFile(file.path, filename: 'profile.jpg'),
    'entityType': 'user_profile',
  });

  final response = await dio.post(
    'http://localhost:3000/api/files/upload',
    data: formData,
    options: Options(
      headers: {
        'Authorization': 'Bearer $accessToken',
      },
    ),
  );

  return response.data;
}
```

---

## Presigned URL (클라이언트 직접 업로드)

클라이언트가 S3에 직접 업로드하는 방식으로 **대용량 파일**에 권장됩니다.

### Step 1: Presigned URL 발급

#### API Endpoint
```
POST /api/files/presigned-url
```

#### Request
```typescript
const response = await fetch('http://localhost:3000/api/files/presigned-url', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fileName: 'flyer-image.jpg',
    fileType: 'image/jpeg',
    fileSize: 5242880,
    entityType: 'flyer',
  }),
});

const { presignedUrl, key, uploadId, expiresIn } = await response.json();
```

#### Response (200 OK)
```json
{
  "presignedUrl": "https://townin-uploads-prod.s3.ap-northeast-2.amazonaws.com/flyers/2025/02/uuid.jpg?X-Amz-Algorithm=...",
  "key": "flyers/2025/02/uuid.jpg",
  "expiresIn": 900,
  "uploadId": "upload-uuid"
}
```

### Step 2: S3에 직접 업로드

```typescript
const uploadResponse = await fetch(presignedUrl, {
  method: 'PUT',
  headers: {
    'Content-Type': 'image/jpeg',
  },
  body: fileBlob,
});

if (!uploadResponse.ok) {
  throw new Error('Upload failed');
}
```

### Step 3: 업로드 확인

#### API Endpoint
```
POST /api/files/confirm
```

#### Request
```typescript
const confirmResponse = await fetch('http://localhost:3000/api/files/confirm', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    uploadId: uploadId,
    key: key,
    originalName: 'flyer-image.jpg',
    size: 5242880,
    mimeType: 'image/jpeg',
  }),
});

const fileData = await confirmResponse.json();
```

#### Response (201 Created)
```json
{
  "id": "file-uuid",
  "url": "https://cdn.townin.kr/flyers/2025/02/uuid.jpg",
  "thumbnailUrl": "https://cdn.townin.kr/flyers/2025/02/uuid_thumbnail.jpg",
  "mediumUrl": "https://cdn.townin.kr/flyers/2025/02/uuid_medium.jpg",
  "size": 5242880,
  "mimeType": "image/jpeg",
  "createdAt": "2025-02-01T10:00:00Z"
}
```

### Flutter Example (Presigned URL)
```dart
import 'package:dio/dio.dart';
import 'dart:io';

Future<Map<String, dynamic>> uploadWithPresignedUrl(
  File file,
  String accessToken,
) async {
  final dio = Dio();

  // Step 1: Get presigned URL
  final presignedResponse = await dio.post(
    'http://localhost:3000/api/files/presigned-url',
    data: {
      'fileName': file.path.split('/').last,
      'fileType': 'image/jpeg',
      'fileSize': await file.length(),
      'entityType': 'flyer',
    },
    options: Options(
      headers: {'Authorization': 'Bearer $accessToken'},
    ),
  );

  final presignedUrl = presignedResponse.data['presignedUrl'];
  final key = presignedResponse.data['key'];
  final uploadId = presignedResponse.data['uploadId'];

  // Step 2: Upload to S3
  final fileBytes = await file.readAsBytes();
  await dio.put(
    presignedUrl,
    data: Stream.fromIterable(fileBytes.map((e) => [e])),
    options: Options(
      headers: {'Content-Type': 'image/jpeg'},
      contentType: 'image/jpeg',
    ),
  );

  // Step 3: Confirm upload
  final confirmResponse = await dio.post(
    'http://localhost:3000/api/files/confirm',
    data: {
      'uploadId': uploadId,
      'key': key,
      'originalName': file.path.split('/').last,
      'size': await file.length(),
      'mimeType': 'image/jpeg',
    },
    options: Options(
      headers: {'Authorization': 'Bearer $accessToken'},
    ),
  );

  return confirmResponse.data;
}
```

---

## 이미지 Variants

업로드된 이미지는 자동으로 다음 Variants가 생성됩니다 (백그라운드 처리):

| Variant | Size | Format | Use Case |
|---------|------|--------|----------|
| **Original** | 원본 | JPEG/PNG | 원본 보관 |
| **Thumbnail** | 150x150 | JPEG | 목록, 프로필 아이콘 |
| **Medium** | 800x600 | JPEG | 상세 페이지 |
| **Large** | 1920x1080 | JPEG | 풀스크린 |
| **WebP** | 원본 크기 | WebP | 30% 용량 절감 |

### Variant URL 접근
```typescript
const originalUrl = 'https://cdn.townin.kr/flyers/2025/02/uuid/image.jpg';
const thumbnailUrl = 'https://cdn.townin.kr/flyers/2025/02/uuid/image_thumbnail.jpg';
const mediumUrl = 'https://cdn.townin.kr/flyers/2025/02/uuid/image_medium.jpg';
const largeUrl = 'https://cdn.townin.kr/flyers/2025/02/uuid/image_large.jpg';
const webpUrl = 'https://cdn.townin.kr/flyers/2025/02/uuid/image_webp.webp';
```

---

## 파일 조회 및 삭제

### 내 파일 목록 조회
```
GET /api/files?page=1&limit=20
```

### 파일 상세 조회
```
GET /api/files/{fileId}
```

### 파일 다운로드 (Signed URL)
```
GET /api/files/{fileId}/download
```

Response:
```json
{
  "url": "https://townin-uploads-prod.s3.ap-northeast-2.amazonaws.com/flyers/2025/02/uuid.jpg?X-Amz-Signature=...",
  "expiresIn": 3600
}
```

### 파일 삭제 (Soft Delete)
```
DELETE /api/files/{fileId}
```

---

## 에러 처리

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "File size exceeds maximum allowed size (10MB)",
  "error": "Bad Request"
}
```

### 400 Bad Request (Invalid MIME Type)
```json
{
  "statusCode": 400,
  "message": "File type not allowed. Allowed types: image/jpeg, image/png, image/webp",
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "File not found",
  "error": "Not Found"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

## 업로드 진행률 표시

### JavaScript (Axios)
```typescript
import axios from 'axios';

const formData = new FormData();
formData.append('file', fileBlob);

axios.post('http://localhost:3000/api/files/upload', formData, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
  onUploadProgress: (progressEvent) => {
    const percentCompleted = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total
    );
    console.log(`Upload progress: ${percentCompleted}%`);
  },
}).then(response => {
  console.log('Upload complete:', response.data);
});
```

### Flutter (Dio)
```dart
final dio = Dio();

final response = await dio.post(
  'http://localhost:3000/api/files/upload',
  data: formData,
  options: Options(
    headers: {'Authorization': 'Bearer $accessToken'},
  ),
  onSendProgress: (sent, total) {
    final progress = (sent / total * 100).toInt();
    print('Upload progress: $progress%');
  },
);
```

---

## AWS S3 버킷 설정 (DevOps)

### 1. S3 버킷 생성
```bash
aws s3 mb s3://townin-uploads-prod --region ap-northeast-2
```

### 2. 퍼블릭 액세스 차단
```bash
aws s3api put-public-access-block \
  --bucket townin-uploads-prod \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

### 3. 서버 측 암호화 활성화
```bash
aws s3api put-bucket-encryption \
  --bucket townin-uploads-prod \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

### 4. Lifecycle Policy 설정
```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket townin-uploads-prod \
  --lifecycle-configuration file://lifecycle-policy.json
```

**lifecycle-policy.json:**
```json
{
  "Rules": [
    {
      "Id": "MoveToStandardIA",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 180,
          "StorageClass": "GLACIER"
        }
      ],
      "Filter": {}
    }
  ]
}
```

---

## CloudFront CDN 설정 (선택 사항)

### 1. CloudFront Distribution 생성
```bash
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

### 2. DNS 레코드 추가 (Route 53)
```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch file://dns-change.json
```

**dns-change.json:**
```json
{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "cdn.townin.kr",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "d123456789abcd.cloudfront.net"
          }
        ]
      }
    }
  ]
}
```

---

## 환경 변수

```env
# AWS S3 & CloudFront
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=townin-uploads-prod
CLOUDFRONT_DOMAIN=cdn.townin.kr
CLOUDFRONT_DISTRIBUTION_ID=E123456789ABCD

# File Upload
MAX_FILE_SIZE=10485760 # 10MB
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp
PRESIGNED_URL_EXPIRES_IN=900 # 15 minutes
```

---

## 참고 자료

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/welcome.html)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)
- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)
