import { latLngToCell } from 'h3-js';

// H3 resolution for grid cells (same as GridCellService)
const H3_RESOLUTION = 9;

/**
 * Sample locations in Seoul for testing
 * 서울 주요 지역 샘플 좌표
 */
export const SEOUL_SAMPLE_LOCATIONS = [
  // 강남역
  { name: '강남역', lat: 37.4979, lng: 127.0276, district: '강남구' },
  // 시청
  { name: '서울시청', lat: 37.5663, lng: 126.9779, district: '중구' },
  // 홍대입구
  { name: '홍대입구', lat: 37.5568, lng: 126.9236, district: '마포구' },
  // 잠실
  { name: '잠실역', lat: 37.5133, lng: 127.1000, district: '송파구' },
  // 신촌
  { name: '신촌역', lat: 37.5559, lng: 126.9364, district: '서대문구' },
  // 이태원
  { name: '이태원', lat: 37.5344, lng: 126.9945, district: '용산구' },
  // 강북구청
  { name: '강북구청', lat: 37.6397, lng: 127.0256, district: '강북구' },
  // 구로디지털단지
  { name: '구로디지털단지', lat: 37.4850, lng: 126.9013, district: '구로구' },
];

/**
 * Generate sample CCTV data
 */
export function generateSampleCctvData() {
  const cctvData = [];

  SEOUL_SAMPLE_LOCATIONS.forEach((location, index) => {
    // 각 위치마다 3-5개의 CCTV 생성
    const numCctvs = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < numCctvs; i++) {
      // 중심점에서 약간 떨어진 랜덤 위치
      const latOffset = (Math.random() - 0.5) * 0.01; // ±500m
      const lngOffset = (Math.random() - 0.5) * 0.01;

      const lat = location.lat + latOffset;
      const lng = location.lng + lngOffset;
      const h3CellId = latLngToCell(lat, lng, H3_RESOLUTION);

      cctvData.push({
        externalId: `SAMPLE_CCTV_${index}_${i}`,
        name: `${location.name} CCTV ${i + 1}`,
        latitude: lat,
        longitude: lng,
        h3CellId,
        address: `서울특별시 ${location.district} ${location.name} 인근`,
        installationAgency: '서울특별시',
        installationPurpose: i % 3 === 0 ? '방범' : i % 3 === 1 ? '교통단속' : '시설안전',
        lastSyncedAt: new Date(),
      });
    }
  });

  return cctvData;
}

/**
 * Generate sample parking data
 */
export function generateSampleParkingData() {
  const parkingData = [];

  SEOUL_SAMPLE_LOCATIONS.forEach((location, index) => {
    // 각 위치마다 2-3개의 주차장 생성
    const numParking = 2 + Math.floor(Math.random() * 2);

    for (let i = 0; i < numParking; i++) {
      const latOffset = (Math.random() - 0.5) * 0.008;
      const lngOffset = (Math.random() - 0.5) * 0.008;

      const lat = location.lat + latOffset;
      const lng = location.lng + lngOffset;
      const h3CellId = latLngToCell(lat, lng, H3_RESOLUTION);

      const totalSpaces = 50 + Math.floor(Math.random() * 150);
      const availableSpaces = Math.floor(totalSpaces * (0.2 + Math.random() * 0.6));

      parkingData.push({
        externalId: `SAMPLE_PARKING_${index}_${i}`,
        name: `${location.name} ${i === 0 ? '공영주차장' : i === 1 ? '민간주차장' : '공용주차장'} ${i + 1}`,
        latitude: lat,
        longitude: lng,
        h3CellId,
        address: `서울특별시 ${location.district} ${location.name} 인근`,
        totalSpaces,
        availableSpaces,
        operationHours: i % 2 === 0 ? '24시간' : '평일 08:00-22:00',
        feeInfo: i % 2 === 0 ? '10분당 500원' : '30분 1,000원',
        phone: '02-1234-5678',
        staticDataSyncedAt: new Date(),
        realtimeDataSyncedAt: new Date(),
      });
    }
  });

  return parkingData;
}

/**
 * Generate sample shelter data
 */
export function generateSampleShelterData() {
  const shelterData = [];

  SEOUL_SAMPLE_LOCATIONS.forEach((location, index) => {
    // 각 위치마다 1-2개의 대피소 생성
    const numShelters = 1 + Math.floor(Math.random() * 2);

    for (let i = 0; i < numShelters; i++) {
      const latOffset = (Math.random() - 0.5) * 0.01;
      const lngOffset = (Math.random() - 0.5) * 0.01;

      const lat = location.lat + latOffset;
      const lng = location.lng + lngOffset;
      const h3CellId = latLngToCell(lat, lng, H3_RESOLUTION);

      const capacity = 100 + Math.floor(Math.random() * 400);
      const areaSqm = capacity * (2.5 + Math.random() * 1.5); // 인당 2.5-4㎡

      shelterData.push({
        externalId: `${location.name}_${location.district}_${i}`,
        name: `${location.name} 지진대피소 ${i + 1}`,
        latitude: lat,
        longitude: lng,
        h3CellId,
        address: `서울특별시 ${location.district} ${location.name} 인근`,
        capacity,
        facilityType: i % 3 === 0 ? '지하대피소' : i % 3 === 1 ? '실내체육관' : '학교',
        areaSqm: Math.round(areaSqm),
        lastSyncedAt: new Date(),
      });
    }
  });

  return shelterData;
}
