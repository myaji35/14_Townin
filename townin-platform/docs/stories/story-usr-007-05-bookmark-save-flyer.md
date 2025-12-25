# Story USR-007-05: Bookmark/Save Flyer

**Epic**: USR-007 Digital Flyer Viewer
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** user
**I want to** save flyers for later
**So that** I can revisit them easily

## Acceptance Criteria

- [ ] 북마크 버튼 (하트 아이콘)
- [ ] 북마크 토글 (저장/해제)
- [ ] 저장된 전단지 목록
- [ ] 저장 개수 제한 (100개)
- [ ] 저장 개수 표시
- [ ] 저장 날짜 표시

## Tasks

### Frontend
- [ ] Bookmark button component
- [ ] Saved flyers screen
- [ ] Empty state for saved flyers
- [ ] Bookmark toggle logic

### Backend
- [ ] POST /flyers/:id/bookmark endpoint
- [ ] DELETE /flyers/:id/bookmark endpoint
- [ ] GET /users/me/bookmarks endpoint
- [ ] Bookmark limit enforcement

### Database
- [ ] Migration: user_bookmarks table

### Testing
- [ ] Unit tests: Bookmark limit
- [ ] Integration test: Bookmark CRUD
- [ ] E2E test: Save & view bookmarks

## Technical Notes

```typescript
// Saved Flyers Screen (Flutter)
class SavedFlyersScreen extends StatefulWidget {
  @override
  _SavedFlyersScreenState createState() => _SavedFlyersScreenState();
}

class _SavedFlyersScreenState extends State<SavedFlyersScreen> {
  List<SavedFlyer> _savedFlyers = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSavedFlyers();
  }

  Future<void> _loadSavedFlyers() async {
    setState(() => _isLoading = true);

    try {
      final flyers = await FlyerService.getSavedFlyers();
      setState(() {
        _savedFlyers = flyers;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('저장된 전단지 로드 실패: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('저장된 전단지'),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : _savedFlyers.isEmpty
              ? _buildEmptyState()
              : Column(
                  children: [
                    // Header
                    Padding(
                      padding: EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Text(
                            '총 ${_savedFlyers.length}개',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Spacer(),
                          Text(
                            '최대 100개',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey.shade600,
                            ),
                          ),
                        ],
                      ),
                    ),

                    Divider(height: 1),

                    // Saved Flyers List
                    Expanded(
                      child: RefreshIndicator(
                        onRefresh: _loadSavedFlyers,
                        child: ListView.builder(
                          padding: EdgeInsets.all(16),
                          itemCount: _savedFlyers.length,
                          itemBuilder: (context, index) {
                            return Padding(
                              padding: EdgeInsets.only(bottom: 16),
                              child: _SavedFlyerCard(
                                savedFlyer: _savedFlyers[index],
                                onRemove: () => _removeBookmark(_savedFlyers[index]),
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.favorite_border,
            size: 80,
            color: Colors.grey.shade400,
          ),
          SizedBox(height: 16),
          Text(
            '저장된 전단지가 없습니다',
            style: TextStyle(fontSize: 18, color: Colors.grey.shade600),
          ),
          SizedBox(height: 8),
          Text(
            '마음에 드는 전단지를 저장해보세요',
            style: TextStyle(fontSize: 14, color: Colors.grey.shade500),
          ),
        ],
      ),
    );
  }

  Future<void> _removeBookmark(SavedFlyer savedFlyer) async {
    try {
      await FlyerService.removeBookmark(savedFlyer.flyerId);

      setState(() {
        _savedFlyers.removeWhere((f) => f.flyerId == savedFlyer.flyerId);
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('저장이 해제되었습니다'),
          duration: Duration(seconds: 1),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('오류가 발생했습니다')),
      );
    }
  }
}

class _SavedFlyerCard extends StatelessWidget {
  final SavedFlyer savedFlyer;
  final VoidCallback onRemove;

  const _SavedFlyerCard({
    required this.savedFlyer,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => FlyerDetailScreen(flyerId: savedFlyer.flyerId),
            ),
          );
        },
        child: Padding(
          padding: EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Thumbnail
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  savedFlyer.imageUrl,
                  width: 80,
                  height: 80,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      width: 80,
                      height: 80,
                      color: Colors.grey.shade300,
                      child: Icon(Icons.broken_image),
                    );
                  },
                ),
              ),

              SizedBox(width: 12),

              // Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      savedFlyer.title,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: 4),
                    Text(
                      savedFlyer.merchantName,
                      style: TextStyle(fontSize: 14, color: Colors.grey.shade700),
                    ),
                    SizedBox(height: 4),
                    Text(
                      '저장일: ${_formatDate(savedFlyer.savedAt)}',
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                    ),
                  ],
                ),
              ),

              // Remove button
              IconButton(
                icon: Icon(Icons.favorite, color: Colors.red),
                onPressed: onRemove,
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return DateFormat('yyyy.MM.dd').format(date);
  }
}

// Saved Flyer Model
class SavedFlyer {
  final String id;
  final String flyerId;
  final String title;
  final String imageUrl;
  final String merchantName;
  final DateTime savedAt;

  SavedFlyer({
    required this.id,
    required this.flyerId,
    required this.title,
    required this.imageUrl,
    required this.merchantName,
    required this.savedAt,
  });

  factory SavedFlyer.fromJson(Map<String, dynamic> json) {
    return SavedFlyer(
      id: json['id'],
      flyerId: json['flyer']['id'],
      title: json['flyer']['title'],
      imageUrl: json['flyer']['imageUrl'],
      merchantName: json['flyer']['merchant']['name'],
      savedAt: DateTime.parse(json['savedAt']),
    );
  }
}

// Flyer Service (Extended)
class FlyerService {
  static Future<void> addBookmark(String flyerId) async {
    await dio.post('/flyers/$flyerId/bookmark');
  }

  static Future<void> removeBookmark(String flyerId) async {
    await dio.delete('/flyers/$flyerId/bookmark');
  }

  static Future<List<SavedFlyer>> getSavedFlyers() async {
    final response = await dio.get('/users/me/bookmarks');
    return (response.data['items'] as List)
        .map((item) => SavedFlyer.fromJson(item))
        .toList();
  }
}

// Backend: Bookmark Endpoints
@Post(':id/bookmark')
@UseGuards(JwtAuthGuard)
async addBookmark(@Param('id') flyerId: string, @Req() req) {
  const userId = req.user.id;

  // Check if flyer exists
  const flyer = await this.flyerRepo.findOne({ where: { id: flyerId } });
  if (!flyer) {
    throw new NotFoundException('Flyer not found');
  }

  // Check if already bookmarked
  const existing = await this.bookmarkRepo.findOne({
    where: { userId, flyerId },
  });

  if (existing) {
    return { message: 'Already bookmarked' };
  }

  // Check bookmark limit
  const count = await this.bookmarkRepo.count({ where: { userId } });
  if (count >= 100) {
    throw new BadRequestException('Bookmark limit reached (max 100)');
  }

  // Create bookmark
  const bookmark = this.bookmarkRepo.create({
    userId,
    flyerId,
  });
  await this.bookmarkRepo.save(bookmark);

  // Increment bookmark count on flyer
  await this.flyerRepo.increment({ id: flyerId }, 'bookmarkCount', 1);

  return { message: 'Bookmark added successfully' };
}

@Delete(':id/bookmark')
@UseGuards(JwtAuthGuard)
async removeBookmark(@Param('id') flyerId: string, @Req() req) {
  const userId = req.user.id;

  const bookmark = await this.bookmarkRepo.findOne({
    where: { userId, flyerId },
  });

  if (!bookmark) {
    throw new NotFoundException('Bookmark not found');
  }

  await this.bookmarkRepo.remove(bookmark);

  // Decrement bookmark count
  await this.flyerRepo.decrement({ id: flyerId }, 'bookmarkCount', 1);

  return { message: 'Bookmark removed successfully' };
}

@Get('me/bookmarks')
@UseGuards(JwtAuthGuard)
async getMyBookmarks(@Query() query: PaginationDto, @Req() req) {
  const userId = req.user.id;

  const [bookmarks, total] = await this.bookmarkRepo.findAndCount({
    where: { userId },
    relations: ['flyer', 'flyer.merchant'],
    order: { createdAt: 'DESC' },
    take: query.limit || 20,
    skip: query.offset || 0,
  });

  return {
    items: bookmarks.map((b) => ({
      id: b.id,
      flyer: b.flyer,
      savedAt: b.createdAt,
    })),
    total,
  };
}

// User Bookmark Entity
@Entity('user_bookmarks')
@Unique(['userId', 'flyerId'])
export class UserBookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  flyerId: string;

  @ManyToOne(() => Flyer, { eager: false })
  flyer: Flyer;

  @CreateDateColumn()
  createdAt: Date;
}

// Migration: user_bookmarks
export class CreateUserBookmarksTable1703456789014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_bookmarks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'flyerId',
            type: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        uniques: [
          {
            name: 'UQ_user_bookmarks_user_flyer',
            columnNames: ['userId', 'flyerId'],
          },
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['flyerId'],
            referencedTableName: 'flyers',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'user_bookmarks',
      new TableIndex({
        name: 'IDX_user_bookmarks_user',
        columnNames: ['userId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_bookmarks');
  }
}
```

## Dependencies

- **Depends on**: USR-007-01 (Flyer Feed)
- **Blocks**: None

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Bookmark button working
- [ ] Saved flyers screen implemented
- [ ] Bookmark toggle working
- [ ] Limit enforcement working
- [ ] Backend APIs working
- [ ] Migration run
- [ ] Tests passing
- [ ] Code reviewed and merged

## Notes

- 최대 100개 제한
- Unique constraint로 중복 방지
- 북마크 개수는 flyer.bookmarkCount에 캐싱
- 저장 날짜 순으로 정렬 (최신 먼저)
- 프로필 또는 메인 메뉴에서 접근
- Eager loading으로 flyer 정보 로드
- Thumbnail 이미지는 80x80
