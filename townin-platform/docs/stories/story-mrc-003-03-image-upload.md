# Story MRC-003-03: Image Upload

**Epic**: MRC-003 Basic Flyer Creation
**Priority**: P0 (Critical)
**Story Points**: 4
**Status**: 📋 Planned

## User Story

**As a** merchant
**I want to** upload product/service images
**So that** my flyer is visually appealing

## Acceptance Criteria

- [ ] 이미지 업로드 (드래그 앤 드롭)
- [ ] 이미지 크기 제한 (10MB)
- [ ] 이미지 자동 리사이징
- [ ] 최대 3장 업로드
- [ ] S3 업로드
- [ ] 업로드 진행률 표시

## Tasks

### Frontend
- [ ] Image upload component
- [ ] Drag & drop
- [ ] Upload progress bar
- [ ] Image preview

### Backend
- [ ] POST /flyers/upload-image
- [ ] Multer file handling
- [ ] Sharp image resizing (300, 800, 1920)
- [ ] S3 upload

### Testing
- [ ] Integration test: Image upload
- [ ] E2E test: Multiple image upload

## Technical Notes

```typescript
// Image Upload Component (Flutter)
class FlyerImageUploadScreen extends StatefulWidget {
  final List<String> initialImages;

  const FlyerImageUploadScreen({this.initialImages = const []});

  @override
  _FlyerImageUploadScreenState createState() => _FlyerImageUploadScreenState();
}

class _FlyerImageUploadScreenState extends State<FlyerImageUploadScreen> {
  List<String> _imageUrls = [];
  bool _isUploading = false;

  @override
  void initState() {
    super.initState();
    _imageUrls = List.from(widget.initialImages);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('이미지 업로드')),
      body: Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          children: [
            Text('이미지 추가 (최대 3장)', style: TextStyle(fontSize: 18)),
            SizedBox(height: 16),

            // Image Grid
            Expanded(
              child: GridView.builder(
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemCount: 3,
                itemBuilder: (context, index) {
                  if (index < _imageUrls.length) {
                    return _ImageTile(
                      imageUrl: _imageUrls[index],
                      onDelete: () => setState(() => _imageUrls.removeAt(index)),
                    );
                  } else {
                    return _AddImageTile(
                      onTap: _pickImage,
                    );
                  }
                },
              ),
            ),

            if (_isUploading) LinearProgressIndicator(),

            SizedBox(height: 16),

            ElevatedButton(
              onPressed: _imageUrls.isNotEmpty ? _continue : null,
              child: Text('다음'),
              style: ElevatedButton.styleFrom(minimumSize: Size(double.infinity, 56)),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickImage() async {
    if (_imageUrls.length >= 3) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('최대 3장까지 업로드 가능합니다')),
      );
      return;
    }

    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);

    if (pickedFile != null) {
      final file = File(pickedFile.path);
      final fileSize = await file.length();

      if (fileSize > 10 * 1024 * 1024) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('파일 크기는 10MB 이하여야 합니다')),
        );
        return;
      }

      setState(() => _isUploading = true);

      try {
        final imageUrl = await FlyerService.uploadImage(file);
        setState(() => _imageUrls.add(imageUrl));
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('업로드 실패: ${e.toString()}')),
        );
      } finally {
        setState(() => _isUploading = false);
      }
    }
  }

  void _continue() {
    Navigator.pop(context, _imageUrls);
  }
}

class _ImageTile extends StatelessWidget {
  final String imageUrl;
  final VoidCallback onDelete;

  const _ImageTile({required this.imageUrl, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            image: DecorationImage(image: NetworkImage(imageUrl), fit: BoxFit.cover),
          ),
        ),
        Positioned(
          top: 4,
          right: 4,
          child: IconButton(
            icon: Icon(Icons.close, color: Colors.white),
            onPressed: onDelete,
          ),
        ),
      ],
    );
  }
}

class _AddImageTile extends StatelessWidget {
  final VoidCallback onTap;

  const _AddImageTile({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.grey.shade200,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(Icons.add_photo_alternate, size: 48, color: Colors.grey),
      ),
    );
  }
}

// Backend: Upload Image
@Post('upload-image')
@UseGuards(JwtAuthGuard)
@UseInterceptors(FileInterceptor('file'))
async uploadFlyerImage(@UploadedFile() file: Express.Multer.File, @Req() req) {
  // Validate
  if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
    throw new BadRequestException('Only images allowed');
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new BadRequestException('File size must be less than 10MB');
  }

  const userId = req.user.id;
  const timestamp = Date.now();

  // Resize to multiple sizes
  const sizes = [
    { name: 'thumb', width: 300, height: 300 },
    { name: 'medium', width: 800, height: 800 },
    { name: 'large', width: 1920, height: 1920 },
  ];

  const uploadPromises = sizes.map(async (size) => {
    const resizedBuffer = await sharp(file.buffer)
      .resize(size.width, size.height, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    const filename = `flyers/${userId}/${timestamp}-${size.name}.jpg`;
    await this.s3.upload({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: filename,
      Body: resizedBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    }).promise();

    return `${process.env.CDN_URL}/${filename}`;
  });

  const urls = await Promise.all(uploadPromises);

  return {
    thumbnail: urls[0],
    medium: urls[1],
    large: urls[2],
  };
}
```

## Dependencies

- **Depends on**: MRC-003-02
- **External**: AWS S3, Sharp, Multer, ImagePicker
- **Blocks**: MRC-003-04

## Definition of Done

- [ ] Upload UI implemented
- [ ] Image validation working
- [ ] S3 upload working
- [ ] Multi-size resizing working
- [ ] Tests passing

## Notes

- 최대 3장
- 자동 리사이징: 300/800/1920
- S3 경로: flyers/{userId}/{timestamp}-{size}.jpg
- CDN URL 반환
