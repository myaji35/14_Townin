# Story USR-002-02: Address Search & Geocoding

**Epic**: USR-002 3-Hub Location Setup
**Priority**: P0 (Critical)
**Story Points**: 3
**Status**: 📋 Planned

## User Story

**As a** user
**I want to** search for addresses
**So that** I can easily find my locations

## Acceptance Criteria

- [ ] 주소 검색 입력 필드
- [ ] 자동완성 제안
- [ ] 도로명/지번 주소 지원
- [ ] 검색 결과 리스트
- [ ] 선택 시 좌표 변환
- [ ] H3 Grid Cell 계산
- [ ] Region 자동 매핑

## Tasks

### Frontend
- [ ] Address search input UI
- [ ] Autocomplete dropdown
- [ ] Search result list
- [ ] Debounced search
- [ ] Loading state

### Backend
- [ ] POST /geocoding/address-to-coords endpoint
- [ ] Kakao Local API integration
- [ ] H3 cell conversion
- [ ] Region lookup

### Testing
- [ ] Unit tests: Address parsing
- [ ] Integration test: Kakao API
- [ ] E2E test: Search flow

## Technical Notes

```typescript
// Address Search Screen (Flutter)
class AddressSearchScreen extends StatefulWidget {
  final HubType hubType;

  const AddressSearchScreen({required this.hubType});

  @override
  _AddressSearchScreenState createState() => _AddressSearchScreenState();
}

class _AddressSearchScreenState extends State<AddressSearchScreen> {
  final _searchController = TextEditingController();
  List<AddressSearchResult> _results = [];
  bool _isLoading = false;
  Timer? _debounce;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('주소 검색'),
      ),
      body: Column(
        children: [
          // Search input
          Padding(
            padding: EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: '도로명, 지번 또는 건물명 입력',
                prefixIcon: Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: Icon(Icons.clear),
                        onPressed: () {
                          setState(() {
                            _searchController.clear();
                            _results.clear();
                          });
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              onChanged: _onSearchChanged,
            ),
          ),

          // Results
          Expanded(
            child: _isLoading
                ? Center(child: CircularProgressIndicator())
                : _results.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.location_searching, size: 64, color: Colors.grey),
                            SizedBox(height: 16),
                            Text(
                              _searchController.text.isEmpty
                                  ? '주소를 검색해주세요'
                                  : '검색 결과가 없습니다',
                              style: TextStyle(color: Colors.grey),
                            ),
                          ],
                        ),
                      )
                    : ListView.separated(
                        itemCount: _results.length,
                        separatorBuilder: (context, index) => Divider(),
                        itemBuilder: (context, index) {
                          final result = _results[index];
                          return _AddressResultItem(
                            result: result,
                            onTap: () => _handleSelectAddress(result),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();

    _debounce = Timer(Duration(milliseconds: 500), () {
      if (query.length >= 2) {
        _searchAddress(query);
      } else {
        setState(() {
          _results.clear();
        });
      }
    });
  }

  Future<void> _searchAddress(String query) async {
    setState(() => _isLoading = true);

    try {
      final results = await GeocodingService.searchAddress(query);
      setState(() {
        _results = results;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('주소 검색 실패: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _handleSelectAddress(AddressSearchResult result) async {
    setState(() => _isLoading = true);

    try {
      // Convert to H3 and get region
      final hubData = await GeocodingService.addressToHubData(
        address: result.addressName,
        lat: result.lat,
        lng: result.lng,
      );

      // Return to hub setup
      Navigator.pop(context, hubData);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('위치 변환 실패: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }
}

class _AddressResultItem extends StatelessWidget {
  final AddressSearchResult result;
  final VoidCallback onTap;

  const _AddressResultItem({
    required this.result,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(Icons.place, color: Color(0xFFF5A623)),
      title: Text(
        result.addressName,
        style: TextStyle(fontWeight: FontWeight.w500),
      ),
      subtitle: result.roadAddressName != null
          ? Text(result.roadAddressName!)
          : null,
      trailing: Icon(Icons.chevron_right, color: Colors.grey),
      onTap: onTap,
    );
  }
}

// Address Search Result Model
class AddressSearchResult {
  final String addressName;
  final String? roadAddressName;
  final double lat;
  final double lng;

  AddressSearchResult({
    required this.addressName,
    this.roadAddressName,
    required this.lat,
    required this.lng,
  });

  factory AddressSearchResult.fromJson(Map<String, dynamic> json) {
    return AddressSearchResult(
      addressName: json['addressName'],
      roadAddressName: json['roadAddressName'],
      lat: json['lat'],
      lng: json['lng'],
    );
  }
}

// Geocoding Service
class GeocodingService {
  static Future<List<AddressSearchResult>> searchAddress(String query) async {
    final response = await dio.post('/geocoding/search-address', data: {
      'query': query,
    });

    return (response.data as List)
        .map((item) => AddressSearchResult.fromJson(item))
        .toList();
  }

  static Future<HubData> addressToHubData({
    required String address,
    required double lat,
    required double lng,
  }) async {
    final response = await dio.post('/geocoding/address-to-hubdata', data: {
      'address': address,
      'lat': lat,
      'lng': lng,
    });

    return HubData.fromJson(response.data);
  }
}

// Backend: Geocoding Module
@Injectable()
export class GeocodingService {
  private readonly kakaoApiKey = process.env.KAKAO_REST_API_KEY;
  private readonly kakaoApiUrl = 'https://dapi.kakao.com/v2/local';

  constructor(
    private readonly h3Service: H3Service,
    private readonly regionService: RegionService,
  ) {}

  async searchAddress(query: string): Promise<AddressSearchResult[]> {
    try {
      const response = await axios.get(`${this.kakaoApiUrl}/search/address.json`, {
        headers: {
          Authorization: `KakaoAK ${this.kakaoApiKey}`,
        },
        params: {
          query,
          size: 10,
        },
      });

      const documents = response.data.documents;

      return documents.map((doc: any) => ({
        addressName: doc.address_name,
        roadAddressName: doc.road_address?.address_name,
        lat: parseFloat(doc.y),
        lng: parseFloat(doc.x),
      }));
    } catch (error) {
      throw new BadRequestException('Kakao address search failed');
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await axios.get(`${this.kakaoApiUrl}/geo/coord2address.json`, {
        headers: {
          Authorization: `KakaoAK ${this.kakaoApiKey}`,
        },
        params: {
          x: lng,
          y: lat,
        },
      });

      const documents = response.data.documents;
      if (documents.length === 0) {
        throw new NotFoundException('Address not found for coordinates');
      }

      // Prefer road address
      if (documents[0].road_address) {
        return documents[0].road_address.address_name;
      }

      return documents[0].address.address_name;
    } catch (error) {
      throw new BadRequestException('Kakao reverse geocoding failed');
    }
  }

  async addressToHubData(
    address: string,
    lat: number,
    lng: number,
  ): Promise<HubDataResponse> {
    // Convert to H3
    const h3Index = this.h3Service.latLngToH3(lat, lng);

    // Find region
    const region = await this.regionService.findRegionByH3Index(h3Index);

    return {
      h3Index,
      address,
      lat,
      lng,
      regionId: region?.id,
      regionName: region?.name,
    };
  }
}

// Geocoding Controller
@Controller('geocoding')
export class GeocodingController {
  constructor(private readonly geocodingService: GeocodingService) {}

  @Post('search-address')
  async searchAddress(@Body() dto: SearchAddressDto) {
    return this.geocodingService.searchAddress(dto.query);
  }

  @Post('reverse-geocode')
  async reverseGeocode(@Body() dto: ReverseGeocodeDto) {
    const address = await this.geocodingService.reverseGeocode(dto.lat, dto.lng);
    return { address };
  }

  @Post('address-to-hubdata')
  async addressToHubData(@Body() dto: AddressToHubDataDto) {
    return this.geocodingService.addressToHubData(
      dto.address,
      dto.lat,
      dto.lng,
    );
  }

  @Post('coords-to-h3')
  async coordsToH3(@Body() dto: CoordsToH3Dto) {
    const h3Index = this.h3Service.latLngToH3(dto.lat, dto.lng, dto.resolution || 9);
    const [centerLat, centerLng] = this.h3Service.h3ToLatLng(h3Index);

    return {
      h3Index,
      centerLat,
      centerLng,
    };
  }
}

// DTOs
export class SearchAddressDto {
  @IsString()
  @MinLength(2)
  query: string;
}

export class ReverseGeocodeDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;
}

export class AddressToHubDataDto {
  @IsString()
  address: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class CoordsToH3Dto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(15)
  resolution?: number;
}

// Region Service Helper
async findRegionByH3Index(h3Index: string): Promise<Region | null> {
  const [lat, lng] = this.h3Service.h3ToLatLng(h3Index);

  const region = await this.regionRepo
    .createQueryBuilder('r')
    .where(
      `ST_Contains(
        r.boundary,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)
      )`,
      { lat, lng },
    )
    .orderBy('r.level', 'DESC') // Get most specific region (dong)
    .getOne();

  return region;
}
```

## Dependencies

- **Depends on**: USR-002-01 (Hub Setup Flow), CORE-002 (Geospatial)
- **External**: Kakao Local API
- **Blocks**: None

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Address search UI implemented
- [ ] Autocomplete working
- [ ] Debounced search working
- [ ] Backend integration complete
- [ ] Kakao API working
- [ ] H3 conversion working
- [ ] Region mapping working
- [ ] Tests passing
- [ ] Code reviewed and merged

## Notes

- 최소 2글자 이상 입력 시 검색
- Debounce 500ms 적용
- 도로명 주소 우선 표시
- 최대 10개 결과 표시
- Kakao REST API 사용 (무료 쿼터 300,000회/일)
- H3 Resolution 9 사용 (500m grid)
- Region은 ST_Contains로 자동 매핑
