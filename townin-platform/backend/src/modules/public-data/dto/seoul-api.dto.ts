/**
 * Seoul Open Data API Response DTOs
 */

/**
 * Common API Response wrapper
 */
export interface SeoulApiResponse<T> {
  [key: string]: {
    list_total_count: number;
    RESULT: {
      CODE: string;
      MESSAGE: string;
    };
    row: T[];
  };
}

/**
 * CCTV API Response
 */
export interface SeoulCctvRow {
  CCTV_ID?: string;
  CCTV_NAME?: string;
  PURPOSE?: string; // 설치 목적
  BOROUGH?: string; // 자치구
  DISTRICT?: string; // 동
  LOCATION?: string; // 위치
  LATITUDE?: string; // 위도
  LONGITUDE?: string; // 경도
  MANAGE_AGENCY?: string; // 관리 기관
  INSTALL_DATE?: string; // 설치일
}

/**
 * Parking Info API Response (정적 데이터)
 */
export interface SeoulParkingInfoRow {
  PARKING_CODE?: string;
  PARKING_NAME?: string;
  ADDR?: string; // 주소
  PARKING_TYPE?: string; // 주차장 유형
  PARKING_TYPE_NM?: string;
  OPERATION_RULE?: string; // 운영 규정
  OPERATION_RULE_NM?: string;
  TEL?: string;
  QUE_STATUS?: string; // 만차 여부
  QUE_STATUS_NM?: string;
  CAPACITY?: string; // 총 주차 면수
  CUR_PARKING?: string; // 현재 주차 대수
  PAY_YN?: string; // 유/무료
  PAY_NM?: string;
  NIGHT_FREE_OPEN?: string; // 야간 무료 개방
  NIGHT_FREE_OPEN_NM?: string;
  WEEKDAY_BEGIN_TIME?: string;
  WEEKDAY_END_TIME?: string;
  WEEKEND_BEGIN_TIME?: string;
  WEEKEND_END_TIME?: string;
  HOLIDAY_BEGIN_TIME?: string;
  HOLIDAY_END_TIME?: string;
  RATES?: string; // 요금 정보
  TIME_RATE?: string;
  ADD_RATES?: string;
  ADD_TIME_RATE?: string;
  BUS_ADD_TIME_RATE?: string;
  BUS_ADD_RATES?: string;
  DAY_MAXIMUM?: string;
  LATITUDE?: string;
  LONGITUDE?: string;
}

/**
 * Parking Available API Response (실시간 데이터)
 */
export interface SeoulParkingAvailableRow {
  PARKING_CODE?: string;
  PARKING_NAME?: string;
  CAPACITY?: string; // 총 주차 면수
  CUR_PARKING?: string; // 현재 주차 대수
  CUR_PARKING_TIME?: string; // 업데이트 시간
}

/**
 * Shelter API Response
 */
export interface SeoulShelterRow {
  OBJECTID?: string;
  EQUP_TYPE?: string; // 시설 유형
  XCNTS?: string; // X 좌표 (경도)
  YCNTS?: string; // Y 좌표 (위도)
  SIGNGU_NM?: string; // 시군구명
  SIGNGU_CD?: string; // 시군구코드
  DTL_ADDR?: string; // 상세 주소
  FCLT_NM?: string; // 시설명
  AREA?: string; // 면적
  CPCTY?: string; // 수용 인원
}
