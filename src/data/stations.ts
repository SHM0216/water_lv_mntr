import { PumpStation } from '@/types';

// 서울시 빗물펌프장 22개소 (샘플 좌표 - 실제 배포 시 SCADA 마스터 데이터와 동기화 필요)
export const STATIONS: PumpStation[] = [
  { id: 'PS01', name: '강남1펌프장', district: '강남구', lat: 37.5172, lng: 127.0473, capacityM3PerMin: 320, innerThreshold: { l1: 1.2, l2: 1.8, l3: 2.4, l4: 3.0 }, outerThreshold: { l1: 3.5, l2: 4.2, l3: 4.8, l4: 5.5 } },
  { id: 'PS02', name: '강남2펌프장', district: '강남구', lat: 37.4979, lng: 127.0276, capacityM3PerMin: 280, innerThreshold: { l1: 1.1, l2: 1.7, l3: 2.3, l4: 2.9 }, outerThreshold: { l1: 3.4, l2: 4.0, l3: 4.6, l4: 5.3 } },
  { id: 'PS03', name: '서초펌프장',   district: '서초구', lat: 37.4836, lng: 127.0327, capacityM3PerMin: 260, innerThreshold: { l1: 1.0, l2: 1.6, l3: 2.2, l4: 2.8 }, outerThreshold: { l1: 3.3, l2: 3.9, l3: 4.5, l4: 5.2 } },
  { id: 'PS04', name: '반포펌프장',   district: '서초구', lat: 37.5044, lng: 127.0119, capacityM3PerMin: 300, innerThreshold: { l1: 1.2, l2: 1.8, l3: 2.4, l4: 3.0 }, outerThreshold: { l1: 3.5, l2: 4.2, l3: 4.8, l4: 5.5 } },
  { id: 'PS05', name: '사당펌프장',   district: '동작구', lat: 37.4765, lng: 126.9818, capacityM3PerMin: 240, innerThreshold: { l1: 1.0, l2: 1.5, l3: 2.1, l4: 2.7 }, outerThreshold: { l1: 3.2, l2: 3.8, l3: 4.4, l4: 5.0 } },
  { id: 'PS06', name: '노량진펌프장', district: '동작구', lat: 37.5129, lng: 126.9423, capacityM3PerMin: 220, innerThreshold: { l1: 1.0, l2: 1.5, l3: 2.1, l4: 2.7 }, outerThreshold: { l1: 3.2, l2: 3.8, l3: 4.4, l4: 5.0 } },
  { id: 'PS07', name: '영등포펌프장', district: '영등포구', lat: 37.5264, lng: 126.8962, capacityM3PerMin: 310, innerThreshold: { l1: 1.2, l2: 1.8, l3: 2.4, l4: 3.0 }, outerThreshold: { l1: 3.5, l2: 4.2, l3: 4.8, l4: 5.5 } },
  { id: 'PS08', name: '여의도펌프장', district: '영등포구', lat: 37.5257, lng: 126.9238, capacityM3PerMin: 340, innerThreshold: { l1: 1.3, l2: 1.9, l3: 2.5, l4: 3.1 }, outerThreshold: { l1: 3.6, l2: 4.3, l3: 4.9, l4: 5.6 } },
  { id: 'PS09', name: '목동펌프장',   district: '양천구', lat: 37.5270, lng: 126.8682, capacityM3PerMin: 350, innerThreshold: { l1: 1.3, l2: 1.9, l3: 2.5, l4: 3.1 }, outerThreshold: { l1: 3.6, l2: 4.3, l3: 4.9, l4: 5.6 } },
  { id: 'PS10', name: '화곡펌프장',   district: '강서구', lat: 37.5410, lng: 126.8400, capacityM3PerMin: 250, innerThreshold: { l1: 1.0, l2: 1.6, l3: 2.2, l4: 2.8 }, outerThreshold: { l1: 3.3, l2: 3.9, l3: 4.5, l4: 5.2 } },
  { id: 'PS11', name: '마포펌프장',   district: '마포구', lat: 37.5586, lng: 126.9136, capacityM3PerMin: 290, innerThreshold: { l1: 1.2, l2: 1.8, l3: 2.4, l4: 3.0 }, outerThreshold: { l1: 3.5, l2: 4.2, l3: 4.8, l4: 5.5 } },
  { id: 'PS12', name: '용산펌프장',   district: '용산구', lat: 37.5326, lng: 126.9903, capacityM3PerMin: 270, innerThreshold: { l1: 1.1, l2: 1.7, l3: 2.3, l4: 2.9 }, outerThreshold: { l1: 3.4, l2: 4.0, l3: 4.6, l4: 5.3 } },
  { id: 'PS13', name: '한남펌프장',   district: '용산구', lat: 37.5384, lng: 127.0008, capacityM3PerMin: 240, innerThreshold: { l1: 1.0, l2: 1.5, l3: 2.1, l4: 2.7 }, outerThreshold: { l1: 3.2, l2: 3.8, l3: 4.4, l4: 5.0 } },
  { id: 'PS14', name: '성수펌프장',   district: '성동구', lat: 37.5447, lng: 127.0557, capacityM3PerMin: 310, innerThreshold: { l1: 1.2, l2: 1.8, l3: 2.4, l4: 3.0 }, outerThreshold: { l1: 3.5, l2: 4.2, l3: 4.8, l4: 5.5 } },
  { id: 'PS15', name: '광진펌프장',   district: '광진구', lat: 37.5384, lng: 127.0824, capacityM3PerMin: 260, innerThreshold: { l1: 1.1, l2: 1.6, l3: 2.2, l4: 2.8 }, outerThreshold: { l1: 3.3, l2: 3.9, l3: 4.5, l4: 5.2 } },
  { id: 'PS16', name: '잠실펌프장',   district: '송파구', lat: 37.5133, lng: 127.1000, capacityM3PerMin: 330, innerThreshold: { l1: 1.3, l2: 1.9, l3: 2.5, l4: 3.1 }, outerThreshold: { l1: 3.6, l2: 4.3, l3: 4.9, l4: 5.6 } },
  { id: 'PS17', name: '가락펌프장',   district: '송파구', lat: 37.4948, lng: 127.1176, capacityM3PerMin: 280, innerThreshold: { l1: 1.1, l2: 1.7, l3: 2.3, l4: 2.9 }, outerThreshold: { l1: 3.4, l2: 4.0, l3: 4.6, l4: 5.3 } },
  { id: 'PS18', name: '강동펌프장',   district: '강동구', lat: 37.5301, lng: 127.1237, capacityM3PerMin: 250, innerThreshold: { l1: 1.0, l2: 1.6, l3: 2.2, l4: 2.8 }, outerThreshold: { l1: 3.3, l2: 3.9, l3: 4.5, l4: 5.2 } },
  { id: 'PS19', name: '중랑펌프장',   district: '중랑구', lat: 37.6064, lng: 127.0929, capacityM3PerMin: 220, innerThreshold: { l1: 1.0, l2: 1.5, l3: 2.1, l4: 2.7 }, outerThreshold: { l1: 3.2, l2: 3.8, l3: 4.4, l4: 5.0 } },
  { id: 'PS20', name: '도봉펌프장',   district: '도봉구', lat: 37.6688, lng: 127.0471, capacityM3PerMin: 200, innerThreshold: { l1: 0.9, l2: 1.4, l3: 2.0, l4: 2.6 }, outerThreshold: { l1: 3.1, l2: 3.7, l3: 4.3, l4: 4.9 } },
  { id: 'PS21', name: '은평펌프장',   district: '은평구', lat: 37.6176, lng: 126.9227, capacityM3PerMin: 240, innerThreshold: { l1: 1.0, l2: 1.5, l3: 2.1, l4: 2.7 }, outerThreshold: { l1: 3.2, l2: 3.8, l3: 4.4, l4: 5.0 } },
  { id: 'PS22', name: '관악펌프장',   district: '관악구', lat: 37.4784, lng: 126.9516, capacityM3PerMin: 290, innerThreshold: { l1: 1.2, l2: 1.8, l3: 2.4, l4: 3.0 }, outerThreshold: { l1: 3.5, l2: 4.2, l3: 4.8, l4: 5.5 } },
];

export const SEOUL_BOUNDS = {
  minLat: 37.43,
  maxLat: 37.70,
  minLng: 126.80,
  maxLng: 127.18,
};

export function stationById(id: string): PumpStation | undefined {
  return STATIONS.find((s) => s.id === id);
}
