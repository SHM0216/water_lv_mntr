import { AlertLevel } from '@/types';

export type ResolvedMode = 'light' | 'dark';
export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemeColors = {
  bg: string;
  bgSoft: string;
  card: string;
  cardHi: string;
  border: string;
  text: string;
  textDim: string;
  textSub: string;
  accent: string;
  accentSoft: string;
  online: string;
  offline: string;
  alert: string;
  alertDeep: string;
  overlay: string;
  inputBg: string;
  onAccent: string;
};

export type SeriesColors = { inner: string; outer: string };

export type Theme = {
  mode: ResolvedMode;
  colors: ThemeColors;
  levelColors: Record<AlertLevel, string>;
  levelBg: Record<AlertLevel, string>;
  seriesColors: SeriesColors;
};

// 5색 팔레트 기반 (초록 / 흰색 / 검정 / 회색 / 빨강)
// 라이트: 배경=흰색, 텍스트=검정
export const lightColors: ThemeColors = {
  bg: '#FFFFFF',
  bgSoft: '#F5F7FA',
  card: '#FFFFFF',
  cardHi: '#EDF1F5',
  border: '#E5E7EB',
  text: '#0F172A',
  textDim: '#6B7280',
  textSub: '#9CA3AF',
  accent: '#16A34A',
  accentSoft: '#DCFCE7',
  online: '#16A34A',
  offline: '#9CA3AF',
  alert: '#EF4444',
  alertDeep: '#B91C1C',
  overlay: 'rgba(255,255,255,0.92)',
  inputBg: '#F5F7FA',
  onAccent: '#FFFFFF',
};

// 다크: 배경=검정 계열, 텍스트=흰색
export const darkColors: ThemeColors = {
  bg: '#0A1628',
  bgSoft: '#11213A',
  card: '#17294A',
  cardHi: '#1E3358',
  border: '#24457A',
  text: '#E8EEF7',
  textDim: '#B4C0D6',
  textSub: '#7C8DA8',
  accent: '#22C55E',
  accentSoft: 'rgba(34,197,94,0.18)',
  online: '#22C55E',
  offline: '#7C8DA8',
  alert: '#F87171',
  alertDeep: '#EF4444',
  overlay: 'rgba(10,22,40,0.88)',
  inputBg: '#11213A',
  onAccent: '#0A1628',
};

const lightLevelColors: Record<AlertLevel, string> = {
  0: '#16A34A',
  1: '#9CA3AF',
  2: '#6B7280',
  3: '#EF4444',
  4: '#B91C1C',
};

const darkLevelColors: Record<AlertLevel, string> = {
  0: '#22C55E',
  1: '#9CA3AF',
  2: '#CBD5E1',
  3: '#F87171',
  4: '#EF4444',
};

const lightLevelBg: Record<AlertLevel, string> = {
  0: 'rgba(22,163,74,0.10)',
  1: 'rgba(156,163,175,0.14)',
  2: 'rgba(107,114,128,0.16)',
  3: 'rgba(239,68,68,0.12)',
  4: 'rgba(185,28,28,0.16)',
};

const darkLevelBg: Record<AlertLevel, string> = {
  0: 'rgba(34,197,94,0.14)',
  1: 'rgba(156,163,175,0.18)',
  2: 'rgba(203,213,225,0.14)',
  3: 'rgba(248,113,113,0.18)',
  4: 'rgba(239,68,68,0.24)',
};

export function getTheme(mode: ResolvedMode): Theme {
  if (mode === 'dark') {
    return {
      mode: 'dark',
      colors: darkColors,
      levelColors: darkLevelColors,
      levelBg: darkLevelBg,
      seriesColors: { inner: darkColors.accent, outer: darkColors.text },
    };
  }
  return {
    mode: 'light',
    colors: lightColors,
    levelColors: lightLevelColors,
    levelBg: lightLevelBg,
    seriesColors: { inner: lightColors.accent, outer: lightColors.text },
  };
}

export const radius = { sm: 8, md: 12, lg: 16, xl: 20 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
