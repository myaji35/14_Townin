# Story USR-002-01: Hub Setup Flow

**Epic**: USR-002 3-Hub Location Setup
**Priority**: P0 (Critical)
**Story Points**: 5
**Status**: 📋 Planned

## User Story

**As a** new user
**I want to** set up my 3 location hubs
**So that** I can receive hyper-local information

## Acceptance Criteria

- [ ] Hub 설정 화면 진입 (온보딩 or 설정)
- [ ] 3가지 Hub 타입 선택 (Home/Work/Family)
- [ ] 주소 검색 또는 지도 클릭
- [ ] H3 Grid Cell 자동 변환
- [ ] 프리뷰 화면 (선택된 위치 확인)
- [ ] 저장 및 완료
- [ ] Skip 가능 (최소 1개 Hub 권장)

## Tasks

### Frontend
- [ ] Hub setup intro screen
- [ ] Hub type selection UI
- [ ] Address search integration
- [ ] Map picker integration
- [ ] Hub preview screen
- [ ] Skip/Save buttons
- [ ] Progress indicator

### Backend
- [ ] PATCH /users/:id/hubs endpoint
- [ ] Hub validation (max 3)
- [ ] H3 cell conversion
- [ ] Region mapping

### Testing
- [ ] Unit tests: Hub validation
- [ ] Integration test: Save hubs
- [ ] E2E test: Complete hub setup

## Technical Notes

```typescript
// Hub Setup Screen (Flutter)
class HubSetupScreen extends StatefulWidget {
  final bool isOnboarding;

  const HubSetupScreen({this.isOnboarding = false});

  @override
  _HubSetupScreenState createState() => _HubSetupScreenState();
}

class _HubSetupScreenState extends State<HubSetupScreen> {
  HubType? _selectedType;
  final Map<HubType, HubData?> _hubs = {
    HubType.HOME: null,
    HubType.WORK: null,
    HubType.FAMILY: null,
  };
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('나의 거점 설정'),
        actions: widget.isOnboarding
            ? [
                TextButton(
                  onPressed: _handleSkip,
                  child: Text('Skip', style: TextStyle(color: Colors.grey)),
                ),
              ]
            : null,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: EdgeInsets.all(24),
              children: [
                Text(
                  '나의 거점을 설정해주세요',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 8),
                Text(
                  '집, 회사, 본가 등 최대 3곳까지 설정 가능해요',
                  style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                ),

                SizedBox(height: 40),

                // Hub Type Cards
                _HubTypeCard(
                  type: HubType.HOME,
                  label: '집',
                  icon: Icons.home,
                  hubData: _hubs[HubType.HOME],
                  onTap: () => _selectHub(HubType.HOME),
                  onDelete: _hubs[HubType.HOME] != null
                      ? () => _deleteHub(HubType.HOME)
                      : null,
                ),

                SizedBox(height: 16),

                _HubTypeCard(
                  type: HubType.WORK,
                  label: '회사',
                  icon: Icons.business,
                  hubData: _hubs[HubType.WORK],
                  onTap: () => _selectHub(HubType.WORK),
                  onDelete: _hubs[HubType.WORK] != null
                      ? () => _deleteHub(HubType.WORK)
                      : null,
                ),

                SizedBox(height: 16),

                _HubTypeCard(
                  type: HubType.FAMILY,
                  label: '본가',
                  icon: Icons.family_restroom,
                  hubData: _hubs[HubType.FAMILY],
                  onTap: () => _selectHub(HubType.FAMILY),
                  onDelete: _hubs[HubType.FAMILY] != null
                      ? () => _deleteHub(HubType.FAMILY)
                      : null,
                ),

                SizedBox(height: 40),

                // Setup count
                Center(
                  child: Text(
                    '${_getSetupCount()}/3 거점 설정됨',
                    style: TextStyle(
                      fontSize: 14,
                      color: Color(0xFFF5A623),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Save button
          Padding(
            padding: EdgeInsets.all(24),
            child: ElevatedButton(
              onPressed: _canSave() && !_isLoading ? _handleSave : null,
              child: _isLoading
                  ? CircularProgressIndicator()
                  : Text(widget.isOnboarding ? '다음' : '저장'),
              style: ElevatedButton.styleFrom(
                minimumSize: Size(double.infinity, 50),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _selectHub(HubType type) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => HubLocationPicker(hubType: type),
      ),
    );

    if (result != null && result is HubData) {
      setState(() {
        _hubs[type] = result;
      });
    }
  }

  void _deleteHub(HubType type) {
    setState(() {
      _hubs[type] = null;
    });
  }

  int _getSetupCount() {
    return _hubs.values.where((hub) => hub != null).length;
  }

  bool _canSave() {
    // At least 1 hub required for onboarding
    if (widget.isOnboarding) {
      return _getSetupCount() >= 1;
    }
    return true;
  }

  Future<void> _handleSave() async {
    setState(() => _isLoading = true);

    try {
      final hubsToSave = <String, HubUpdateDto>{};

      if (_hubs[HubType.HOME] != null) {
        hubsToSave['home'] = _hubs[HubType.HOME]!.toDto();
      }
      if (_hubs[HubType.WORK] != null) {
        hubsToSave['work'] = _hubs[HubType.WORK]!.toDto();
      }
      if (_hubs[HubType.FAMILY] != null) {
        hubsToSave['family'] = _hubs[HubType.FAMILY]!.toDto();
      }

      await UserService.updateHubs(hubsToSave);

      if (widget.isOnboarding) {
        _navigateToNext();
      } else {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('거점이 저장되었습니다')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('거점 저장 실패: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _handleSkip() {
    _navigateToNext();
  }

  void _navigateToNext() {
    // Navigate to dashboard or next onboarding step
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) => DashboardScreen()),
      (route) => false,
    );
  }
}

class _HubTypeCard extends StatelessWidget {
  final HubType type;
  final String label;
  final IconData icon;
  final HubData? hubData;
  final VoidCallback onTap;
  final VoidCallback? onDelete;

  const _HubTypeCard({
    required this.type,
    required this.label,
    required this.icon,
    required this.hubData,
    required this.onTap,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final isSet = hubData != null;

    return InkWell(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSet ? Color(0xFFF5A623).withOpacity(0.1) : Colors.grey.shade100,
          border: Border.all(
            color: isSet ? Color(0xFFF5A623) : Colors.grey.shade300,
            width: isSet ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 40,
              color: isSet ? Color(0xFFF5A623) : Colors.grey.shade600,
            ),
            SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isSet ? Color(0xFFF5A623) : Colors.black87,
                    ),
                  ),
                  if (isSet)
                    Text(
                      hubData!.address,
                      style: TextStyle(fontSize: 14, color: Colors.grey.shade700),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    )
                  else
                    Text(
                      '거점 추가하기',
                      style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                    ),
                ],
              ),
            ),
            if (isSet && onDelete != null)
              IconButton(
                icon: Icon(Icons.close, color: Colors.grey),
                onPressed: onDelete,
              )
            else
              Icon(Icons.chevron_right, color: Colors.grey),
          ],
        ),
      ),
    );
  }
}

// Hub Data Model
class HubData {
  final String h3Index;
  final String address;
  final double lat;
  final double lng;
  final String? regionId;
  final String? regionName;

  HubData({
    required this.h3Index,
    required this.address,
    required this.lat,
    required this.lng,
    this.regionId,
    this.regionName,
  });

  HubUpdateDto toDto() {
    return HubUpdateDto(
      h3Index: h3Index,
      address: address,
      lat: lat,
      lng: lng,
    );
  }
}

class HubUpdateDto {
  final String h3Index;
  final String address;
  final double lat;
  final double lng;

  HubUpdateDto({
    required this.h3Index,
    required this.address,
    required this.lat,
    required this.lng,
  });

  Map<String, dynamic> toJson() {
    return {
      'h3Index': h3Index,
      'address': address,
      'lat': lat,
      'lng': lng,
    };
  }
}

enum HubType { HOME, WORK, FAMILY }

// User Service
class UserService {
  static Future<void> updateHubs(Map<String, HubUpdateDto> hubs) async {
    final userId = await AuthService.getCurrentUserId();
    await dio.patch('/users/$userId/hubs', data: hubs);
  }

  static Future<Map<HubType, HubData>> getHubs() async {
    final response = await dio.get('/users/me/hubs');
    final Map<HubType, HubData> result = {};

    if (response.data['home'] != null) {
      result[HubType.HOME] = HubData.fromJson(response.data['home']);
    }
    if (response.data['work'] != null) {
      result[HubType.WORK] = HubData.fromJson(response.data['work']);
    }
    if (response.data['family'] != null) {
      result[HubType.FAMILY] = HubData.fromJson(response.data['family']);
    }

    return result;
  }
}

// Backend: Update Hubs Endpoint
@Patch(':id/hubs')
@UseGuards(JwtAuthGuard)
async updateHubs(
  @Param('id') id: string,
  @Body() dto: UpdateHubsDto,
  @Req() req,
) {
  if (req.user.id !== id) {
    throw new ForbiddenException('Cannot update other user hubs');
  }

  const user = await this.userRepo.findOne({ where: { id } });

  // Update home hub
  if (dto.home) {
    user.homeH3Index = dto.home.h3Index;
    user.homeAddress = dto.home.address;

    // Find region by H3 index
    const region = await this.regionService.findRegionByH3Index(dto.home.h3Index);
    user.homeRegion = region;
  }

  // Update work hub
  if (dto.work) {
    user.workH3Index = dto.work.h3Index;
    user.workAddress = dto.work.address;

    const region = await this.regionService.findRegionByH3Index(dto.work.h3Index);
    user.workRegion = region;
  }

  // Update family hub
  if (dto.family) {
    user.familyH3Index = dto.family.h3Index;
    user.familyAddress = dto.family.address;

    const region = await this.regionService.findRegionByH3Index(dto.family.h3Index);
    user.familyRegion = region;
  }

  user.hubsLastUpdated = new Date();

  await this.userRepo.save(user);

  return { message: 'Hubs updated successfully' };
}

@Get('me/hubs')
@UseGuards(JwtAuthGuard)
async getMyHubs(@Req() req) {
  const user = await this.userRepo.findOne({
    where: { id: req.user.id },
    relations: ['homeRegion', 'workRegion', 'familyRegion'],
  });

  const result: any = {};

  if (user.homeH3Index) {
    const [lat, lng] = this.h3Service.h3ToLatLng(user.homeH3Index);
    result.home = {
      h3Index: user.homeH3Index,
      address: user.homeAddress,
      lat,
      lng,
      region: user.homeRegion ? {
        id: user.homeRegion.id,
        name: user.homeRegion.name,
      } : null,
    };
  }

  if (user.workH3Index) {
    const [lat, lng] = this.h3Service.h3ToLatLng(user.workH3Index);
    result.work = {
      h3Index: user.workH3Index,
      address: user.workAddress,
      lat,
      lng,
      region: user.workRegion ? {
        id: user.workRegion.id,
        name: user.workRegion.name,
      } : null,
    };
  }

  if (user.familyH3Index) {
    const [lat, lng] = this.h3Service.h3ToLatLng(user.familyH3Index);
    result.family = {
      h3Index: user.familyH3Index,
      address: user.familyAddress,
      lat,
      lng,
      region: user.familyRegion ? {
        id: user.familyRegion.id,
        name: user.familyRegion.name,
      } : null,
    };
  }

  return result;
}

// Update Hubs DTO
export class UpdateHubsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => HubDto)
  home?: HubDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => HubDto)
  work?: HubDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => HubDto)
  family?: HubDto;
}

export class HubDto {
  @IsString()
  @Length(15, 15)
  h3Index: string;

  @IsString()
  address: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;
}
```

## Dependencies

- **Depends on**: USR-001 (User Onboarding), CORE-002 (Geospatial)
- **Blocks**: USR-002-02, USR-002-03

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Hub setup UI implemented
- [ ] Hub type selection working
- [ ] Hub save/delete working
- [ ] Backend API working
- [ ] H3 conversion working
- [ ] Region mapping working
- [ ] Tests passing
- [ ] Code reviewed and merged

## Notes

- 온보딩 시 최소 1개 Hub 설정 권장
- 설정에서는 0개도 가능 (나중에 추가)
- 최대 3개 제한
- H3 Grid Cell로 저장 (정확한 좌표 미저장)
- 주소는 표시용으로만 사용
- Region 자동 매핑 (ST_Contains 쿼리)
