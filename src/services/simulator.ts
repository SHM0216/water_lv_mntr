import { AlertLevel, LevelReading, PumpStation } from '@/types';
import { STATIONS } from '@/data/stations';

// Deterministic pseudo-random so all platforms show the same pattern per station.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function computeLevel(station: PumpStation, inner: number, outer: number): AlertLevel {
  const i = station.innerThreshold;
  const o = station.outerThreshold;
  const innerLvl: AlertLevel =
    inner >= i.l4 ? 4 : inner >= i.l3 ? 3 : inner >= i.l2 ? 2 : inner >= i.l1 ? 1 : 0;
  const outerLvl: AlertLevel =
    outer >= o.l4 ? 4 : outer >= o.l3 ? 3 : outer >= o.l2 ? 2 : outer >= o.l1 ? 1 : 0;
  return Math.max(innerLvl, outerLvl) as AlertLevel;
}

export function simulateReading(station: PumpStation, t: number): LevelReading {
  const rand = mulberry32(hashId(station.id));
  const phase = rand() * Math.PI * 2;
  const amp = 0.35 + rand() * 0.35;
  const baseInner = 0.55 + rand() * 0.4;
  const baseOuter = 1.9 + rand() * 0.8;
  const minutes = t / 60000;
  // A slow diurnal sway + a mid-frequency wave + a small noise.
  const slow = Math.sin((minutes / 60) * Math.PI + phase) * 0.25;
  const mid = Math.sin((minutes / 7) * Math.PI + phase) * amp;
  const noise = (rand() - 0.5) * 0.08;
  const stormBoost = Math.max(0, Math.sin((minutes / 180) * Math.PI)) * 1.3;

  const innerLevelM = Math.max(0, baseInner + slow + mid * 0.6 + noise + stormBoost * 0.7);
  const outerLevelM = Math.max(0, baseOuter + slow * 0.6 + mid * 0.4 + noise + stormBoost);

  const level = computeLevel(station, innerLevelM, outerLevelM);
  const pumpsTotal = 4 + (hashId(station.id) % 3);
  const pumpsRunning = Math.min(pumpsTotal, level);

  return {
    stationId: station.id,
    timestamp: t,
    innerLevelM: round2(innerLevelM),
    outerLevelM: round2(outerLevelM),
    pumpsRunning,
    pumpsTotal,
    level,
    online: true,
  };
}

export function simulateAll(t: number): LevelReading[] {
  return STATIONS.map((s) => simulateReading(s, t));
}

export function simulate24hTrend(stationId: string, endTs: number, stepMs = 30_000): LevelReading[] {
  const station = STATIONS.find((s) => s.id === stationId);
  if (!station) return [];
  const start = endTs - 24 * 60 * 60 * 1000;
  const out: LevelReading[] = [];
  for (let t = start; t <= endTs; t += stepMs) {
    out.push(simulateReading(station, t));
  }
  return out;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
