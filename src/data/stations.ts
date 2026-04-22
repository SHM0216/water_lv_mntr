import { PumpStation } from '@/types';

/**
 * 대구광역시 빗물펌프장 22개소 (2025-04-09 현황 기준)
 * 출처: 대구광역시_빗물펌프장 현황_20250409.csv
 *
 * 주요 컴럼 매핑:
 * - name, district, address: CSV 위치
 * - capacityM3PerMin: 배수용량(최대)
 * - 가동수위 (innerThreshold.l1) / 한계수위 (innerThreshold.l4)
 *   l2, l3 은 l1~l4 구간을 선형 보간 (관심/주의/경계 3단계)
 * - outerThreshold: 방류측(하천) 수위 추정치 — 센서 미설치 스테이션은 가동수위+1.8 ~ 한계수위+0.8 로 대체
 * - 좌표(lat/lng): 주소 기반 근사 (실배치 시 SCADA/GIS 마스터로 대체)
 */

type ThresholdInput = { gating: number; critical: number };

function interpolate(t: ThresholdInput): { l1: number; l2: number; l3: number; l4: number } {
  const { gating, critical } = t;
  const span = critical - gating;
  return {
    l1: round1(gating),
    l2: round1(gating + span * 0.33),
    l3: round1(gating + span * 0.66),
    l4: round1(critical),
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function outer(t: ThresholdInput): { l1: number; l2: number; l3: number; l4: number } {
  // 외수위 근사: 하천 수위가 유수지보다 약 0.6~0.8m 높게 유지된다고 가정
  return interpolate({ gating: t.gating + 0.6, critical: t.critical + 0.8 });
}

export const STATIONS: PumpStation[] = [
  {
    id: 'PS01', name: '월성펌프장', district: '달서구',
    lat: 35.840, lng: 128.530, capacityM3PerMin: 14150,
    innerThreshold: interpolate({ gating: 1.5, critical: 4.9 }),
    outerThreshold: outer({ gating: 1.5, critical: 4.9 }),
  },
  {
    id: 'PS02', name: '죽곡펌프장', district: '달성군 다사읍',
    lat: 35.858, lng: 128.463, capacityM3PerMin: 795,
    innerThreshold: interpolate({ gating: 5.4, critical: 7.4 }),
    outerThreshold: outer({ gating: 5.4, critical: 7.4 }),
  },
  {
    id: 'PS03', name: '성서5차펌프장', district: '달성군 다사읍',
    lat: 35.853, lng: 128.471, capacityM3PerMin: 1033,
    innerThreshold: interpolate({ gating: 1.3, critical: 2.5 }),
    outerThreshold: outer({ gating: 1.3, critical: 2.5 }),
  },
  {
    id: 'PS04', name: '이현펌프장', district: '서구',
    lat: 35.876, lng: 128.544, capacityM3PerMin: 1520,
    innerThreshold: interpolate({ gating: 2.0, critical: 3.5 }),
    outerThreshold: outer({ gating: 2.0, critical: 3.5 }),
  },
  {
    id: 'PS05', name: '3공단펌프장', district: '서구',
    lat: 35.882, lng: 128.557, capacityM3PerMin: 1580,
    innerThreshold: interpolate({ gating: 2.2, critical: 4.5 }),
    outerThreshold: outer({ gating: 2.2, critical: 4.5 }),
  },
  {
    id: 'PS06', name: '비산펌프장', district: '서구',
    lat: 35.879, lng: 128.558, capacityM3PerMin: 284,
    innerThreshold: interpolate({ gating: 2.0, critical: 5.0 }),
    outerThreshold: outer({ gating: 2.0, critical: 5.0 }),
  },
  {
    id: 'PS07', name: '팔달펌프장', district: '북구',
    lat: 35.910, lng: 128.550, capacityM3PerMin: 1030,
    innerThreshold: interpolate({ gating: 4.5, critical: 5.9 }),
    outerThreshold: outer({ gating: 4.5, critical: 5.9 }),
  },
  {
    id: 'PS08', name: '노곡펌프장', district: '북구',
    lat: 35.925, lng: 128.554, capacityM3PerMin: 480,
    innerThreshold: interpolate({ gating: 1.4, critical: 5.5 }),
    outerThreshold: outer({ gating: 1.4, critical: 5.5 }),
  },
  {
    id: 'PS09', name: '조야펌프장', district: '북구',
    lat: 35.909, lng: 128.564, capacityM3PerMin: 1800,
    innerThreshold: interpolate({ gating: 1.4, critical: 5.5 }),
    outerThreshold: outer({ gating: 1.4, critical: 5.5 }),
  },
  {
    id: 'PS10', name: '침산펌프장', district: '북구',
    lat: 35.887, lng: 128.583, capacityM3PerMin: 750,
    innerThreshold: interpolate({ gating: 3.7, critical: 5.0 }),
    outerThreshold: outer({ gating: 3.7, critical: 5.0 }),
  },
  {
    id: 'PS11', name: '산격펌프장', district: '북구',
    lat: 35.900, lng: 128.619, capacityM3PerMin: 585,
    innerThreshold: interpolate({ gating: 2.0, critical: 4.5 }),
    outerThreshold: outer({ gating: 2.0, critical: 4.5 }),
  },
  {
    id: 'PS12', name: '봉무펌프장', district: '동구',
    lat: 35.917, lng: 128.656, capacityM3PerMin: 2191,
    innerThreshold: interpolate({ gating: 5.2, critical: 8.0 }),
    outerThreshold: outer({ gating: 5.2, critical: 8.0 }),
  },
  {
    id: 'PS13', name: '동촌펌프장', district: '동구',
    lat: 35.894, lng: 128.658, capacityM3PerMin: 2760,
    innerThreshold: interpolate({ gating: 1.5, critical: 4.0 }),
    outerThreshold: outer({ gating: 1.5, critical: 4.0 }),
  },
  {
    id: 'PS14', name: '신암펌프장', district: '동구',
    lat: 35.881, lng: 128.641, capacityM3PerMin: 2275,
    innerThreshold: interpolate({ gating: 7.2, critical: 10.0 }),
    outerThreshold: outer({ gating: 7.2, critical: 10.0 }),
  },
  {
    id: 'PS15', name: '방촌펌프장', district: '동구',
    lat: 35.888, lng: 128.675, capacityM3PerMin: 135,
    innerThreshold: interpolate({ gating: 2.0, critical: 5.0 }),
    outerThreshold: outer({ gating: 2.0, critical: 5.0 }),
  },
  {
    id: 'PS16', name: '방촌2펌프장', district: '동구',
    lat: 35.893, lng: 128.670, capacityM3PerMin: 550,
    innerThreshold: interpolate({ gating: 3.7, critical: 4.9 }),
    outerThreshold: outer({ gating: 3.7, critical: 4.9 }),
  },
  {
    id: 'PS17', name: '팔현펌프장', district: '수성구',
    lat: 35.836, lng: 128.669, capacityM3PerMin: 660,
    innerThreshold: interpolate({ gating: 3.7, critical: 5.5 }),
    outerThreshold: outer({ gating: 3.7, critical: 5.5 }),
  },
  {
    id: 'PS18', name: '율하펌프장', district: '동구',
    lat: 35.872, lng: 128.698, capacityM3PerMin: 675,
    innerThreshold: interpolate({ gating: 6.8, critical: 8.3 }),
    outerThreshold: outer({ gating: 6.8, critical: 8.3 }),
  },
  {
    id: 'PS19', name: '서재펌프장', district: '달성군 다사읍',
    lat: 35.867, lng: 128.467, capacityM3PerMin: 350,
    innerThreshold: interpolate({ gating: 4.0, critical: 4.5 }),
    outerThreshold: outer({ gating: 4.0, critical: 4.5 }),
  },
  {
    id: 'PS20', name: '서재2펌프장', district: '달성군 다사읍',
    lat: 35.865, lng: 128.456, capacityM3PerMin: 1120,
    innerThreshold: interpolate({ gating: 4.0, critical: 6.0 }),
    outerThreshold: outer({ gating: 4.0, critical: 6.0 }),
  },
  {
    id: 'PS21', name: '창리펌프장', district: '달성군 구지면',
    lat: 35.670, lng: 128.457, capacityM3PerMin: 2675,
    innerThreshold: interpolate({ gating: 5.4, critical: 7.6 }),
    outerThreshold: outer({ gating: 5.4, critical: 7.6 }),
  },
  {
    id: 'PS22', name: '가천펌프장', district: '수성구',
    lat: 35.813, lng: 128.667, capacityM3PerMin: 550,
    innerThreshold: interpolate({ gating: 3.5, critical: 6.2 }),
    outerThreshold: outer({ gating: 3.5, critical: 6.2 }),
  },
];

// 대구 시역 범위 (창리가 구지면 최남단이라 남측 경계 확장)
export const DAEGU_BOUNDS = {
  minLat: 35.64,
  maxLat: 35.94,
  minLng: 128.43,
  maxLng: 128.72,
};

// 하위 호환: 기존 import 경로 유지
export const SEOUL_BOUNDS = DAEGU_BOUNDS;

export function stationById(id: string): PumpStation | undefined {
  return STATIONS.find((s) => s.id === id);
}
