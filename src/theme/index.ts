import { AlertLevel } from '@/types';

// 5색 팔레트: 초록 / 흰색 / 검정 / 회색 / 빨강(경보)
export const palette = {
  green: '#16A34A',
  greenDeep: '#15803D',
  greenSoft: '#DCFCE7',
  white: '#FFFFFF',
  black: '#0F172A',
  gray: '#9CA3AF',
  grayDark: '#6B7280',
  grayLight: '#E5E7EB',
  graySurface: '#F5F7FA',
  red: '#EF4444',
  redDeep: '#B91C1C',
  redSoft: '#FEE2E2',
};

export const colors = {
  bg: palette.white,
  bgSoft: palette.graySurface,
  card: palette.white,
  cardHi: '#EDF1F5',
  border: palette.grayLight,
  text: palette.black,
  textDim: palette.grayDark,
  textSub: palette.gray,
  accent: palette.green,
  accentSoft: palette.greenSoft,
  online: palette.green,
  offline: palette.gray,
  alert: palette.red,
  alertDeep: palette.redDeep,
};

// 5색 팔레트 안에서만 단계 표현: 정상=초록, 관심/주의=회색 농도, 경계/심각=빨강 농도
export const levelColors: Record<AlertLevel, string> = {
  0: palette.green,
  1: palette.gray,
  2: palette.grayDark,
  3: palette.red,
  4: palette.redDeep,
};

export const levelBg: Record<AlertLevel, string> = {
  0: 'rgba(22,163,74,0.10)',
  1: 'rgba(156,163,175,0.14)',
  2: 'rgba(107,114,128,0.16)',
  3: 'rgba(239,68,68,0.12)',
  4: 'rgba(185,28,28,0.16)',
};

// 차트 시리즈 색
export const seriesColors = {
  inner: palette.green,
  outer: palette.black,
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 20 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
