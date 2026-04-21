import { AlertLevel } from '@/types';

export const colors = {
  bg: '#0A1628',
  bgSoft: '#11213A',
  card: '#17294A',
  cardHi: '#1E3358',
  border: '#24457A',
  text: '#E8EEF7',
  textDim: '#95A7C2',
  textSub: '#64789B',
  accent: '#4F8BFF',
  accentSoft: '#1D3A6E',
  online: '#2ECC71',
  offline: '#6C7A89',
};

export const levelColors: Record<AlertLevel, string> = {
  0: '#2ECC71',
  1: '#F1C40F',
  2: '#F39C12',
  3: '#E67E22',
  4: '#E74C3C',
};

export const levelBg: Record<AlertLevel, string> = {
  0: 'rgba(46,204,113,0.12)',
  1: 'rgba(241,196,15,0.14)',
  2: 'rgba(243,156,18,0.16)',
  3: 'rgba(230,126,34,0.18)',
  4: 'rgba(231,76,60,0.22)',
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 20 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
