export type AlertLevel = 0 | 1 | 2 | 3 | 4;

export const ALERT_LABELS: Record<AlertLevel, string> = {
  0: '정상',
  1: '관심',
  2: '주의',
  3: '경계',
  4: '심각',
};

export type PumpStation = {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  innerThreshold: { l1: number; l2: number; l3: number; l4: number };
  outerThreshold: { l1: number; l2: number; l3: number; l4: number };
  capacityM3PerMin: number;
};

export type LevelReading = {
  stationId: string;
  timestamp: number;
  innerLevelM: number;
  outerLevelM: number;
  pumpsRunning: number;
  pumpsTotal: number;
  level: AlertLevel;
  online: boolean;
};

export type AlertEvent = {
  id: string;
  stationId: string;
  timestamp: number;
  level: AlertLevel;
  message: string;
  acknowledged: boolean;
  ackBy?: string;
  ackAt?: number;
};

export type DutyAssignment = {
  id: string;
  date: string;
  shift: 'day' | 'night';
  primary: string;
  backup: string;
  phone: string;
  note?: string;
};
