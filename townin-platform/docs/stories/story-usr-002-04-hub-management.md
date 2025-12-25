# Story USR-002-04: Hub Management

**Epic**: USR-002 3-Hub Location Setup
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** user
**I want to** view, edit, and delete my hubs
**So that** I can keep my locations up to date

## Acceptance Criteria

- [ ] Hub 목록 조회
- [ ] Hub별 정보 표시 (타입, 주소, 설정일)
- [ ] Hub 수정 (주소 변경)
- [ ] Hub 삭제
- [ ] 최대 3개 제한 표시
- [ ] Empty state 표시

## Tasks

### Frontend
- [ ] Hub list screen
- [ ] Hub card component
- [ ] Hub edit modal
- [ ] Hub delete confirmation
- [ ] Empty state UI

### Backend
- [ ] GET /users/me/hubs endpoint
- [ ] DELETE /users/:id/hubs/:type endpoint
- [ ] Hub validation

### Testing
- [ ] Unit tests: Hub validation
- [ ] Integration test: Hub CRUD
- [ ] E2E test: Hub management

## Technical Notes

```typescript
// Hub Management Screen (Flutter)
class HubManagementScreen extends StatefulWidget {
  @override
  _HubManagementScreenState createState() => _HubManagementScreenState();
}

class _HubManagementScreenState extends State<HubManagementScreen> {
  Map<HubType, HubData>? _hubs;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadHubs();
  }

  Future<void> _loadHubs() async {
    setState(() => _isLoading = true);

    try {
      final hubs = await UserService.getHubs();
      setState(() {
        _hubs = hubs;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('거점 로드 실패: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('나의 거점'),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : ListView(
              padding: EdgeInsets.all(16),
              children: [
                // Header
                Text(
                  '최대 3곳의 거점을 설정할 수 있어요',
                  style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
                ),
                SizedBox(height: 8),
                Text(
                  '${_hubs?.length ?? 0}/3 거점 설정됨',
                  style: TextStyle(
                    fontSize: 14,
                    color: Color(0xFFF5A623),
                    fontWeight: FontWeight.w500,
                  ),
                ),

                SizedBox(height: 24),

                // Hub Cards
                _buildHubCard(
                  type: HubType.HOME,
                  label: '집',
                  icon: Icons.home,
                  hubData: _hubs?[HubType.HOME],
                ),

                SizedBox(height: 16),

                _buildHubCard(
                  type: HubType.WORK,
                  label: '회사',
                  icon: Icons.business,
                  hubData: _hubs?[HubType.WORK],
                ),

                SizedBox(height: 16),

                _buildHubCard(
                  type: HubType.FAMILY,
                  label: '본가',
                  icon: Icons.family_restroom,
                  hubData: _hubs?[HubType.FAMILY],
                ),
              ],
            ),
    );
  }

  Widget _buildHubCard({
    required HubType type,
    required String label,
    required IconData icon,
    HubData? hubData,
  }) {
    final isSet = hubData != null;

    return Card(
      elevation: 2,
      child: InkWell(
        onTap: () => _editHub(type, hubData),
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: isSet
                      ? Color(0xFFF5A623).withOpacity(0.1)
                      : Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  icon,
                  size: 32,
                  color: isSet ? Color(0xFFF5A623) : Colors.grey.shade400,
                ),
              ),
              SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 4),
                    if (isSet) ...[
                      Text(
                        hubData.address,
                        style: TextStyle(fontSize: 14, color: Colors.grey.shade700),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: 4),
                      if (hubData.regionName != null)
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade200,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            hubData.regionName!,
                            style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
                          ),
                        ),
                    ] else
                      Text(
                        '거점을 추가해주세요',
                        style: TextStyle(fontSize: 14, color: Colors.grey.shade500),
                      ),
                  ],
                ),
              ),
              if (isSet)
                PopupMenuButton<String>(
                  onSelected: (value) {
                    if (value == 'edit') {
                      _editHub(type, hubData);
                    } else if (value == 'delete') {
                      _deleteHub(type);
                    }
                  },
                  itemBuilder: (context) => [
                    PopupMenuItem(
                      value: 'edit',
                      child: Row(
                        children: [
                          Icon(Icons.edit, size: 20),
                          SizedBox(width: 8),
                          Text('수정'),
                        ],
                      ),
                    ),
                    PopupMenuItem(
                      value: 'delete',
                      child: Row(
                        children: [
                          Icon(Icons.delete, size: 20, color: Colors.red),
                          SizedBox(width: 8),
                          Text('삭제', style: TextStyle(color: Colors.red)),
                        ],
                      ),
                    ),
                  ],
                )
              else
                Icon(Icons.chevron_right, color: Colors.grey),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _editHub(HubType type, HubData? currentData) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => HubLocationPicker(hubType: type),
      ),
    );

    if (result != null && result is HubData) {
      setState(() => _isLoading = true);

      try {
        final hubsToUpdate = <String, HubUpdateDto>{};

        switch (type) {
          case HubType.HOME:
            hubsToUpdate['home'] = result.toDto();
            break;
          case HubType.WORK:
            hubsToUpdate['work'] = result.toDto();
            break;
          case HubType.FAMILY:
            hubsToUpdate['family'] = result.toDto();
            break;
        }

        await UserService.updateHubs(hubsToUpdate);
        await _loadHubs();

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('거점이 ${currentData != null ? '수정' : '추가'}되었습니다')),
        );
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('거점 저장 실패: ${e.toString()}')),
        );
      } finally {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _deleteHub(HubType type) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('거점 삭제'),
        content: Text('이 거점을 삭제하시겠습니까?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('취소'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: Text('삭제'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() => _isLoading = true);

    try {
      await UserService.deleteHub(type);
      await _loadHubs();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('거점이 삭제되었습니다')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('거점 삭제 실패: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }
}

// User Service (Extended)
class UserService {
  static Future<void> deleteHub(HubType type) async {
    final userId = await AuthService.getCurrentUserId();
    final typeString = type.toString().split('.').last.toLowerCase();

    await dio.delete('/users/$userId/hubs/$typeString');
  }
}

// Backend: Delete Hub Endpoint
@Delete(':id/hubs/:type')
@UseGuards(JwtAuthGuard)
async deleteHub(
  @Param('id') id: string,
  @Param('type') type: string,
  @Req() req,
) {
  if (req.user.id !== id) {
    throw new ForbiddenException('Cannot delete other user hub');
  }

  const user = await this.userRepo.findOne({ where: { id } });

  switch (type) {
    case 'home':
      user.homeH3Index = null;
      user.homeAddress = null;
      user.homeRegion = null;
      break;
    case 'work':
      user.workH3Index = null;
      user.workAddress = null;
      user.workRegion = null;
      break;
    case 'family':
      user.familyH3Index = null;
      user.familyAddress = null;
      user.familyRegion = null;
      break;
    default:
      throw new BadRequestException('Invalid hub type');
  }

  user.hubsLastUpdated = new Date();

  await this.userRepo.save(user);

  return { message: `${type} hub deleted successfully` };
}

// Hub Info Card Component
class HubInfoCard extends StatelessWidget {
  final HubData hubData;

  const HubInfoCard({required this.hubData});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.place, color: Color(0xFFF5A623)),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    hubData.address,
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                  ),
                ),
              ],
            ),
            Divider(height: 24),
            _InfoRow(
              label: '좌표',
              value: '${hubData.lat.toStringAsFixed(6)}, ${hubData.lng.toStringAsFixed(6)}',
            ),
            SizedBox(height: 8),
            _InfoRow(
              label: 'Grid Cell',
              value: hubData.h3Index,
            ),
            if (hubData.regionName != null) ...[
              SizedBox(height: 8),
              _InfoRow(
                label: '행정구역',
                value: hubData.regionName!,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SizedBox(
          width: 80,
          child: Text(
            label,
            style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: TextStyle(fontSize: 14),
          ),
        ),
      ],
    );
  }
}
```

## Dependencies

- **Depends on**: USR-002-01, USR-002-02, USR-002-03
- **Blocks**: USR-002-05

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Hub list UI implemented
- [ ] Hub view working
- [ ] Hub edit working
- [ ] Hub delete working
- [ ] Delete confirmation working
- [ ] Backend API working
- [ ] Tests passing
- [ ] Code reviewed and merged

## Notes

- 거점 목록은 설정에서 접근
- 수정 시 기존 Hub Location Picker 재사용
- 삭제 시 확인 다이얼로그 표시
- Empty state: "거점을 추가해주세요"
- 최대 3개 제한은 UI에 표시만 (백엔드에서도 검증)
- Hub 정보: 주소, 좌표, H3 Index, 행정구역, 설정일
- hubsLastUpdated 타임스탬프 업데이트
