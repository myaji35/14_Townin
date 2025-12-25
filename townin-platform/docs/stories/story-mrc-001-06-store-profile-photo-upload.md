# Story MRC-001-06: Store Profile Photo Upload

**Epic**: MRC-001 Merchant Onboarding
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** merchant
**I want to** upload my store photo
**So that** customers recognize my business

## Acceptance Criteria

- [ ] 이미지 업로드 (JPG, PNG)
- [ ] 이미지 크기 제한 (5MB)
- [ ] 이미지 자동 리사이징
- [ ] S3 업로드
- [ ] 프로필 사진 미리보기
- [ ] Skip 가능

## Tasks

### Frontend
- [ ] Image picker
- [ ] Image preview
- [ ] Upload progress

### Backend
- [ ] POST /merchants/stores/:id/profile-image
- [ ] Multer file upload
- [ ] Sharp image resizing
- [ ] S3 upload
- [ ] URL storage

### Database
- [ ] Add profileImageUrl to stores

### Testing
- [ ] Integration test: Image upload
- [ ] E2E test: Complete flow

## Technical Notes

```typescript
// Store Profile Photo Upload (Flutter)
import 'package:image_picker/image_picker.dart';

class StoreProfilePhotoUploadScreen extends StatefulWidget {
  @override
  _StoreProfilePhotoUploadScreenState createState() => _StoreProfilePhotoUploadScreenState();
}

class _StoreProfilePhotoUploadScreenState extends State<StoreProfilePhotoUploadScreen> {
  File? _imageFile;
  bool _isUploading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('상점 사진')),
      body: Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          children: [
            Text('상점 사진 업로드', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            Text('고객에게 상점을 소개할 사진을 올려주세요 (선택)', style: TextStyle(color: Colors.grey)),

            SizedBox(height: 40),

            GestureDetector(
              onTap: _pickImage,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                  borderRadius: BorderRadius.circular(16),
                  image: _imageFile != null
                      ? DecorationImage(image: FileImage(_imageFile!), fit: BoxFit.cover)
                      : null,
                ),
                child: _imageFile == null
                    ? Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.add_a_photo, size: 48, color: Colors.grey),
                          SizedBox(height: 8),
                          Text('사진 추가', style: TextStyle(color: Colors.grey)),
                        ],
                      )
                    : null,
              ),
            ),

            if (_imageFile != null) ...[
              SizedBox(height: 16),
              TextButton.icon(
                icon: Icon(Icons.delete),
                label: Text('사진 삭제'),
                onPressed: () => setState(() => _imageFile = null),
              ),
            ],

            Spacer(),

            ElevatedButton(
              onPressed: _isUploading ? null : _handleSubmit,
              child: _isUploading ? CircularProgressIndicator() : Text(_imageFile == null ? 'Skip' : '완료'),
              style: ElevatedButton.styleFrom(minimumSize: Size(double.infinity, 56)),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);

    if (pickedFile != null) {
      final file = File(pickedFile.path);
      final fileSize = await file.length();

      if (fileSize > 5 * 1024 * 1024) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('파일 크기는 5MB 이하여야 합니다')),
        );
        return;
      }

      setState(() => _imageFile = file);
    }
  }

  Future<void> _handleSubmit() async {
    if (_imageFile != null) {
      setState(() => _isUploading = true);
      try {
        await MerchantService.uploadStoreProfilePhoto(_imageFile!);
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('사진 업로드 실패')),
        );
        setState(() => _isUploading = false);
        return;
      }
    }

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => MerchantDashboardScreen()),
    );
  }
}

// Merchant Service
class MerchantService {
  static Future<void> uploadStoreProfilePhoto(File file) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(file.path),
    });

    await dio.post('/merchants/stores/me/profile-image', data: formData);
  }
}

// Backend: Upload Profile Image
@Post('stores/:id/profile-image')
@UseGuards(JwtAuthGuard)
@UseInterceptors(FileInterceptor('file'))
async uploadProfileImage(
  @Param('id') id: string,
  @UploadedFile() file: Express.Multer.File,
  @Req() req,
) {
  const store = await this.storeRepo.findOne({
    where: { id, ownerId: req.user.id },
  });

  if (!store) {
    throw new NotFoundException('Store not found');
  }

  // Validate file
  if (!file.mimetype.match(/^image\/(jpeg|png)$/)) {
    throw new BadRequestException('Only JPG and PNG images are allowed');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new BadRequestException('File size must be less than 5MB');
  }

  // Resize image
  const resizedBuffer = await sharp(file.buffer)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  // Upload to S3
  const filename = `stores/${id}/profile-${Date.now()}.jpg`;
  const s3Params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: filename,
    Body: resizedBuffer,
    ContentType: 'image/jpeg',
    ACL: 'public-read',
  };

  await this.s3.upload(s3Params).promise();

  const imageUrl = `${process.env.CDN_URL}/${filename}`;

  // Delete old image if exists
  if (store.profileImageUrl) {
    // Delete from S3
  }

  store.profileImageUrl = imageUrl;
  await this.storeRepo.save(store);

  return { profileImageUrl: imageUrl };
}

// Migration
export class AddProfileImageUrl1703456789019 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'stores',
      new TableColumn({
        name: 'profileImageUrl',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('stores', 'profileImageUrl');
  }
}
```

## Dependencies

- **Depends on**: MRC-001-05
- **External**: AWS S3, Sharp, Multer
- **Blocks**: MRC-001-07

## Definition of Done

- [ ] Image picker working
- [ ] Upload working
- [ ] Resizing working
- [ ] S3 storage working
- [ ] Migration run
- [ ] Tests passing

## Notes

- 선택 사항 (Skip 가능)
- 최대 5MB
- 자동 리사이징: 800x800
- S3 저장 경로: stores/{storeId}/profile-{timestamp}.jpg
- CDN URL 반환
