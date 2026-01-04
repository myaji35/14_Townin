import 'package:dio/dio.dart';

/// 공공 데이터 포털 API 클라이언트
/// https://www.data.go.kr/
class PublicDataAPIClient {
  final Dio _dio;
  
  // 공공 데이터 포털 인증키 (환경변수에서 로드)
  static const String _serviceKey = String.fromEnvironment(
    'PUBLIC_DATA_API_KEY',
    defaultValue: 'DEMO_KEY', // 테스트용
  );
  
  PublicDataAPIClient({Dio? dio}) : _dio = dio ?? Dio() {
    _setupDio();
  }

  void _setupDio() {
    _dio.options = BaseOptions(
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    );
  }

  /// 1. CCTV 정보 조회
  /// API: 안전행정부_지방행정인허가데이터_CCTV설치현황
  Future<List<CCTVInfo>> getCCTVList({
    String? sigunguName = '의정부시',
    int pageNo = 1,
    int numOfRows = 100,
  }) async {
    try {
      final response = await _dio.get(
        'http://apis.data.go.kr/B553530/ctprvnCctvDataService/getCctvData',
        queryParameters: {
          'serviceKey': _serviceKey,
          'sigunguNm': sigunguName,
          'pageNo': pageNo,
          'numOfRows': numOfRows,
          'type': 'json',
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['response']?['body']?['items'] != null) {
          final items = data['response']['body']['items']['item'] as List;
          return items.map((item) => CCTVInfo.fromJson(item)).toList();
        }
      }
      return [];
    } catch (e) {
      print('CCTV API Error: $e');
      return _getMockCCTVData();
    }
  }

  /// 2. 공영주차장 정보 조회
  /// API: 국토교통부_공영주차장정보
  Future<List<ParkingInfo>> getParkingList({
    String? sigunguName = '의정부시',
    int pageNo = 1,
    int numOfRows = 100,
  }) async {
    try {
      final response = await _dio.get(
        'http://apis.data.go.kr/B553881/Parking/ParkingInfo',
        queryParameters: {
          'serviceKey': _serviceKey,
          'sigunguNm': sigunguName,
          'pageNo': pageNo,
          'numOfRows': numOfRows,
          'type': 'json',
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['response']?['body']?['items'] != null) {
          final items = data['response']['body']['items']['item'] as List;
          return items.map((item) => ParkingInfo.fromJson(item)).toList();
        }
      }
      return [];
    } catch (e) {
      print('Parking API Error: $e');
      return _getMockParkingData();
    }
  }

  /// 3. 민방위 대피소 정보 조회
  /// API: 행정안전부_민방위대피소표준데이터
  Future<List<ShelterInfo>> getShelterList({
    String? sigunguName = '의정부시',
    int pageNo = 1,
    int numOfRows = 100,
  }) async {
    try {
      final response = await _dio.get(
        'http://apis.data.go.kr/1741000/EmergencyAssemblyArea/getEmergencyAssemblyArea',
        queryParameters: {
          'serviceKey': _serviceKey,
          'sigunguNm': sigunguName,
          'pageNo': pageNo,
          'numOfRows': numOfRows,
          'type': 'json',
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['EmergencyAssemblyArea']?[1]?['row'] != null) {
          final items = data['EmergencyAssemblyArea'][1]['row'] as List;
          return items.map((item) => ShelterInfo.fromJson(item)).toList();
        }
      }
      return [];
    } catch (e) {
      print('Shelter API Error: $e');
      return _getMockShelterData();
    }
  }

  /// 4. 병원 정보 조회
  /// API: 보건복지부_전국병원정보서비스
  Future<List<HospitalInfo>> getHospitalList({
    String? sigunguName = '의정부시',
    int pageNo = 1,
    int numOfRows = 100,
  }) async {
    try {
      final response = await _dio.get(
        'http://apis.data.go.kr/B551182/hospInfoService/getHospBasisList',
        queryParameters: {
          'serviceKey': _serviceKey,
          'sigunguCd': '41150', // 의정부시 행정구역코드
          'pageNo': pageNo,
          'numOfRows': numOfRows,
          'type': 'json',
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['response']?['body']?['items'] != null) {
          final items = data['response']['body']['items']['item'] as List;
          return items.map((item) => HospitalInfo.fromJson(item)).toList();
        }
      }
      return [];
    } catch (e) {
      print('Hospital API Error: $e');
      return _getMockHospitalData();
    }
  }

  /// 5. 약국 정보 조회
  /// API: 식품의약품안전처_의약품개방API
  Future<List<PharmacyInfo>> getPharmacyList({
    String? sigunguName = '의정부시',
    int pageNo = 1,
    int numOfRows = 100,
  }) async {
    try {
      final response = await _dio.get(
        'http://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyListInfoInqire',
        queryParameters: {
          'serviceKey': _serviceKey,
          'Q0': sigunguName,
          'pageNo': pageNo,
          'numOfRows': numOfRows,
          'type': 'json',
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['response']?['body']?['items'] != null) {
          final items = data['response']['body']['items']['item'] as List;
          return items.map((item) => PharmacyInfo.fromJson(item)).toList();
        }
      }
      return [];
    } catch (e) {
      print('Pharmacy API Error: $e');
      return _getMockPharmacyData();
    }
  }

  // Mock 데이터 (API 실패 시 대체)
  List<CCTVInfo> _getMockCCTVData() {
    return [
      CCTVInfo(id: '1', name: 'CCTV #101', location: '의정부동 195-45', lat: 37.7388, lng: 127.0474, status: 'active'),
      CCTVInfo(id: '2', name: 'CCTV #102', location: '신곡동 724-8', lat: 37.7569, lng: 127.0626, status: 'active'),
    ];
  }

  List<ParkingInfo> _getMockParkingData() {
    return [
      ParkingInfo(id: '1', name: '의정부역 공영주차장', location: '의정부동 195-1', lat: 37.7394, lng: 127.0476, total: 150, available: 45, fee: '시간당 1,000원'),
      ParkingInfo(id: '2', name: '신곡동 공용주차장', location: '신곡동 724-3', lat: 37.7569, lng: 127.0626, total: 80, available: 0, fee: '시간당 800원'),
    ];
  }

  List<ShelterInfo> _getMockShelterData() {
    return [
      ShelterInfo(id: '1', name: '의정부시청 대피소', location: '의정부동 195-1', lat: 37.7388, lng: 127.0474, capacity: 500),
      ShelterInfo(id: '2', name: '신곡초등학교 대피소', location: '신곡동 724-1', lat: 37.7569, lng: 127.0626, capacity: 300),
    ];
  }

  List<HospitalInfo> _getMockHospitalData() {
    return [
      HospitalInfo(id: '1', name: '의정부성모병원', location: '의정부동 65-1', lat: 37.7367, lng: 127.0513, phone: '031-820-3000', hours: '24시간'),
    ];
  }

  List<PharmacyInfo> _getMockPharmacyData() {
    return [
      PharmacyInfo(id: '1', name: '온누리약국', location: '신곡동 724-3', lat: 37.7569, lng: 127.0626, phone: '031-840-2000', hours: '09:00-22:00'),
    ];
  }
}

// 데이터 모델
class CCTVInfo {
  final String id;
  final String name;
  final String location;
  final double lat;
  final double lng;
  final String status;

  CCTVInfo({
    required this.id,
    required this.name,
    required this.location,
    required this.lat,
    required this.lng,
    required this.status,
  });

  factory CCTVInfo.fromJson(Map<String, dynamic> json) {
    return CCTVInfo(
      id: json['cctvId']?.toString() ?? '',
      name: json['cctvNm'] ?? '',
      location: json['instlPlc'] ?? '',
      lat: double.tryParse(json['lat']?.toString() ?? '0') ?? 0.0,
      lng: double.tryParse(json['lot']?.toString() ?? '0') ?? 0.0,
      status: json['mngSttus'] ?? 'active',
    );
  }
}

class ParkingInfo {
  final String id;
  final String name;
  final String location;
  final double lat;
  final double lng;
  final int total;
  final int available;
  final String fee;

  ParkingInfo({
    required this.id,
    required this.name,
    required this.location,
    required this.lat,
    required this.lng,
    required this.total,
    required this.available,
    required this.fee,
  });

  factory ParkingInfo.fromJson(Map<String, dynamic> json) {
    return ParkingInfo(
      id: json['prkplceNo']?.toString() ?? '',
      name: json['prkplceNm'] ?? '',
      location: json['rdnmadr'] ?? '',
      lat: double.tryParse(json['latitude']?.toString() ?? '0') ?? 0.0,
      lng: double.tryParse(json['longitude']?.toString() ?? '0') ?? 0.0,
      total: int.tryParse(json['prkcmprt']?.toString() ?? '0') ?? 0,
      available: int.tryParse(json['curPrkCnt']?.toString() ?? '0') ?? 0,
      fee: json['parkingchrgeInfo'] ?? '',
    );
  }
}

class ShelterInfo {
  final String id;
  final String name;
  final String location;
  final double lat;
  final double lng;
  final int capacity;

  ShelterInfo({
    required this.id,
    required this.name,
    required this.location,
    required this.lat,
    required this.lng,
    required this.capacity,
  });

  factory ShelterInfo.fromJson(Map<String, dynamic> json) {
    return ShelterInfo(
      id: json['id']?.toString() ?? '',
      name: json['vt_acmdfclty_nm'] ?? '',
      location: json['dtl_adres'] ?? '',
      lat: double.tryParse(json['ycord']?.toString() ?? '0') ?? 0.0,
      lng: double.tryParse(json['xcord']?.toString() ?? '0') ?? 0.0,
      capacity: int.tryParse(json['acp_psbl_nmpr']?.toString() ?? '0') ?? 0,
    );
  }
}

class HospitalInfo {
  final String id;
  final String name;
  final String location;
  final double lat;
  final double lng;
  final String phone;
  final String hours;

  HospitalInfo({
    required this.id,
    required this.name,
    required this.location,
    required this.lat,
    required this.lng,
    required this.phone,
    required this.hours,
  });

  factory HospitalInfo.fromJson(Map<String, dynamic> json) {
    return HospitalInfo(
      id: json['ykiho']?.toString() ?? '',
      name: json['yadmNm'] ?? '',
      location: json['addr'] ?? '',
      lat: double.tryParse(json['YPos']?.toString() ?? '0') ?? 0.0,
      lng: double.tryParse(json['XPos']?.toString() ?? '0') ?? 0.0,
      phone: json['telno'] ?? '',
      hours: json['hospUrl'] ?? '24시간',
    );
  }
}

class PharmacyInfo {
  final String id;
  final String name;
  final String location;
  final double lat;
  final double lng;
  final String phone;
  final String hours;

  PharmacyInfo({
    required this.id,
    required this.name,
    required this.location,
    required this.lat,
    required this.lng,
    required this.phone,
    required this.hours,
  });

  factory PharmacyInfo.fromJson(Map<String, dynamic> json) {
    return PharmacyInfo(
      id: json['hpid']?.toString() ?? '',
      name: json['dutyName'] ?? '',
      location: json['dutyAddr'] ?? '',
      lat: double.tryParse(json['wgs84Lat']?.toString() ?? '0') ?? 0.0,
      lng: double.tryParse(json['wgs84Lon']?.toString() ?? '0') ?? 0.0,
      phone: json['dutyTel1'] ?? '',
      hours: '09:00-22:00',
    );
  }
}
