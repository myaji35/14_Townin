# Story USR-007-06: Share Flyer

**Epic**: USR-007 Digital Flyer Viewer
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** user
**I want to** share flyers with friends
**So that** they can also benefit

## Acceptance Criteria

- [ ] 공유 버튼
- [ ] 네이티브 공유 시트 (모바일)
- [ ] 공유 옵션 (카카오톡, SMS, 링크 복사)
- [ ] 공유 링크 생성
- [ ] 공유 횟수 기록
- [ ] 공유 링크로 앱 열기 (deep link)

## Tasks

### Frontend
- [ ] Share button
- [ ] Native share API integration
- [ ] Deep link handling
- [ ] Kakao Share SDK integration

### Backend
- [ ] POST /flyers/:id/share endpoint
- [ ] GET /flyers/shared/:shareId endpoint
- [ ] Share link generation
- [ ] Share count tracking

### Testing
- [ ] Unit tests: Share link generation
- [ ] Integration test: Share API
- [ ] E2E test: Share & open link

## Technical Notes

```typescript
// Share Functionality (Flutter)
import 'package:share_plus/share_plus.dart';
import 'package:kakao_flutter_sdk_share/kakao_flutter_sdk_share.dart';

class FlyerDetailScreen extends StatefulWidget {
  // ... existing code

  Future<void> _shareFlyer() async {
    showModalBottomSheet(
      context: context,
      builder: (context) => ShareOptionsSheet(flyer: _flyer!),
    );
  }
}

class ShareOptionsSheet extends StatelessWidget {
  final FlyerDetail flyer;

  const ShareOptionsSheet({required this.flyer});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            '전단지 공유하기',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),

          SizedBox(height: 24),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _ShareOption(
                icon: Icons.chat,
                label: '카카오톡',
                color: Color(0xFFFEE500),
                onTap: () => _shareViaKakao(context),
              ),
              _ShareOption(
                icon: Icons.message,
                label: 'SMS',
                color: Colors.green,
                onTap: () => _shareViaSMS(context),
              ),
              _ShareOption(
                icon: Icons.link,
                label: '링크 복사',
                color: Color(0xFFF5A623),
                onTap: () => _copyLink(context),
              ),
              _ShareOption(
                icon: Icons.more_horiz,
                label: '더보기',
                color: Colors.grey,
                onTap: () => _shareNative(context),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _shareViaKakao(BuildContext context) async {
    try {
      // Generate share link
      final shareData = await FlyerService.generateShareLink(flyer.id);

      // Kakao Link Template
      final template = FeedTemplate(
        content: Content(
          title: flyer.title,
          description: flyer.description ?? '',
          imageUrl: Uri.parse(flyer.imageUrl),
          link: Link(
            webUrl: Uri.parse(shareData.shareUrl),
            mobileWebUrl: Uri.parse(shareData.shareUrl),
          ),
        ),
        buttons: [
          Button(
            title: '앱에서 보기',
            link: Link(
              androidExecutionParams: {'flyerId': flyer.id},
              iosExecutionParams: {'flyerId': flyer.id},
            ),
          ),
        ],
      );

      final uri = await ShareClient.instance.shareDefault(template: template);
      await ShareClient.instance.launchKakaoTalk(uri);

      Navigator.pop(context);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('카카오톡으로 공유되었습니다')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('공유 실패: ${e.toString()}')),
      );
    }
  }

  Future<void> _shareViaSMS(BuildContext context) async {
    try {
      final shareData = await FlyerService.generateShareLink(flyer.id);

      final message = '${flyer.title}\n\n${shareData.shareUrl}';

      // SMS launcher
      final uri = Uri(
        scheme: 'sms',
        queryParameters: {'body': message},
      );

      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
        Navigator.pop(context);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('SMS 열기 실패')),
      );
    }
  }

  Future<void> _copyLink(BuildContext context) async {
    try {
      final shareData = await FlyerService.generateShareLink(flyer.id);

      await Clipboard.setData(ClipboardData(text: shareData.shareUrl));

      Navigator.pop(context);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('링크가 복사되었습니다'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('복사 실패')),
      );
    }
  }

  Future<void> _shareNative(BuildContext context) async {
    try {
      final shareData = await FlyerService.generateShareLink(flyer.id);

      await Share.share(
        '${flyer.title}\n\n${shareData.shareUrl}',
        subject: '타운인 전단지',
      );

      Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('공유 실패')),
      );
    }
  }
}

class _ShareOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ShareOption({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, size: 32, color: color),
          ),
          SizedBox(height: 8),
          Text(
            label,
            style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
          ),
        ],
      ),
    );
  }
}

// Share Data Model
class ShareData {
  final String shareId;
  final String shareUrl;

  ShareData({
    required this.shareId,
    required this.shareUrl,
  });

  factory ShareData.fromJson(Map<String, dynamic> json) {
    return ShareData(
      shareId: json['shareId'],
      shareUrl: json['shareUrl'],
    );
  }
}

// Flyer Service (Extended)
class FlyerService {
  static Future<ShareData> generateShareLink(String flyerId) async {
    final response = await dio.post('/flyers/$flyerId/share');
    return ShareData.fromJson(response.data);
  }
}

// Deep Link Handling (main.dart)
class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final _navigatorKey = GlobalKey<NavigatorState>();

  @override
  void initState() {
    super.initState();
    _initDeepLinks();
  }

  void _initDeepLinks() async {
    // App Links (Android) / Universal Links (iOS)
    final appLinks = AppLinks();

    // Handle initial link if app was opened from link
    final initialUri = await appLinks.getInitialLink();
    if (initialUri != null) {
      _handleDeepLink(initialUri);
    }

    // Listen to link updates
    appLinks.uriLinkStream.listen((uri) {
      _handleDeepLink(uri);
    });
  }

  void _handleDeepLink(Uri uri) {
    // Parse URI: townin://flyer/:id or https://townin.app/flyers/shared/:shareId
    if (uri.pathSegments.contains('flyers')) {
      final flyerId = uri.pathSegments.last;

      // Navigate to flyer detail
      _navigatorKey.currentState?.push(
        MaterialPageRoute(
          builder: (context) => FlyerDetailScreen(flyerId: flyerId),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: _navigatorKey,
      home: DashboardScreen(),
    );
  }
}

// Backend: Share Endpoints
@Post(':id/share')
@UseGuards(OptionalJwtAuthGuard)
async shareFlyer(@Param('id') flyerId: string, @Req() req) {
  const userId = req.user?.id;

  const flyer = await this.flyerRepo.findOne({ where: { id: flyerId } });

  if (!flyer) {
    throw new NotFoundException('Flyer not found');
  }

  // Generate share ID (short URL)
  const shareId = nanoid(10);

  // Store share record (optional analytics)
  if (userId) {
    await this.shareRepo.save({
      shareId,
      flyerId,
      userId,
    });
  }

  // Increment share count
  await this.flyerRepo.increment({ id: flyerId }, 'shareCount', 1);

  const shareUrl = `${process.env.APP_URL}/flyers/shared/${shareId}`;

  return {
    shareId,
    shareUrl,
    flyerId,
  };
}

@Get('shared/:shareId')
async getSharedFlyer(@Param('shareId') shareId: string, @Res() res) {
  // Lookup share record
  const share = await this.shareRepo.findOne({
    where: { shareId },
    relations: ['flyer'],
  });

  if (!share) {
    throw new NotFoundException('Shared link not found');
  }

  // Redirect to app deep link or web page
  const flyerId = share.flyerId;
  const deepLink = `townin://flyer/${flyerId}`;
  const webFallback = `${process.env.FRONTEND_URL}/flyers/${flyerId}`;

  // Mobile user-agent detection
  const userAgent = res.req.headers['user-agent'] || '';
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);

  if (isMobile) {
    // Try to open app, fallback to web
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="refresh" content="0;url=${deepLink}" />
          <script>
            setTimeout(function() {
              window.location.href = '${webFallback}';
            }, 1500);
          </script>
        </head>
        <body>
          <p>Opening Townin app...</p>
        </body>
      </html>
    `);
  } else {
    return res.redirect(webFallback);
  }
}

// Flyer Share Entity
@Entity('flyer_shares')
export class FlyerShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  shareId: string;

  @Column()
  flyerId: string;

  @ManyToOne(() => Flyer)
  flyer: Flyer;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
```

## Dependencies

- **Depends on**: USR-007-03 (Flyer Detail)
- **External**: share_plus, kakao_flutter_sdk_share, app_links, nanoid
- **Blocks**: None

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Share button implemented
- [ ] Kakao share working
- [ ] SMS share working
- [ ] Link copy working
- [ ] Native share working
- [ ] Deep link handling working
- [ ] Share link generation working
- [ ] Backend APIs working
- [ ] Tests passing
- [ ] Code reviewed and merged

## Notes

- Kakao Share는 Kakao Flutter SDK 사용
- SMS는 url_launcher 사용
- 네이티브 공유는 share_plus 사용
- Deep link는 app_links 패키지
- Share ID는 nanoid로 10자 생성
- Share 횟수는 flyer.shareCount에 캐싱
- 공유 링크: https://townin.app/flyers/shared/:shareId
- Deep link: townin://flyer/:id
- 모바일에서는 앱 우선, 폴백은 웹
- Share 기록은 analytics용 (선택)
