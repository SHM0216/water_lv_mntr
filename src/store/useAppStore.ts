import { create } from 'zustand';
import { AlertEvent, AlertLevel, DutyAssignment, LevelReading } from '@/types';
import { STATIONS } from '@/data/stations';
import { simulateAll } from '@/services/simulator';
import {
  cacheReadings,
  loadCachedReadings,
  loadAlerts,
  saveAlerts,
  loadDuty,
  saveDuty,
  loadPushToken,
  savePushToken,
  getBatteryGuideAck,
  setBatteryGuideAck,
} from '@/services/storage';

type State = {
  readings: Record<string, LevelReading>;
  alerts: AlertEvent[];
  duty: DutyAssignment[];
  online: boolean;
  cacheAt: number | null;
  currentTime: number;
  pushToken: string | null;
  batteryGuideAck: boolean;
  currentUser: string;
};

type Actions = {
  hydrate: () => Promise<void>;
  tick: () => void;
  setOnline: (v: boolean) => void;
  acknowledgeAlert: (id: string) => Promise<void>;
  upsertDuty: (d: DutyAssignment) => Promise<void>;
  removeDuty: (id: string) => Promise<void>;
  setPushToken: (t: string | null) => Promise<void>;
  setBatteryAck: (v: boolean) => Promise<void>;
  setCurrentUser: (name: string) => void;
};

const INITIAL_DUTY: DutyAssignment[] = [
  {
    id: 'D-today-night',
    date: new Date().toISOString().slice(0, 10),
    shift: 'night',
    primary: '김주임',
    backup: '박대리',
    phone: '010-0000-0000',
    note: '야간 집중 호우 예보 - 강남·서초 중점 모니터링',
  },
];

function buildAlertsFromReadings(existing: AlertEvent[], readings: LevelReading[]): AlertEvent[] {
  const now = Date.now();
  const out = [...existing];
  const recentByStation = new Map<string, AlertEvent>();
  for (const a of existing) {
    const prev = recentByStation.get(a.stationId);
    if (!prev || prev.timestamp < a.timestamp) recentByStation.set(a.stationId, a);
  }
  for (const r of readings) {
    if (r.level === 0) continue;
    const prev = recentByStation.get(r.stationId);
    const sameLevelRecent = prev && prev.level === r.level && now - prev.timestamp < 10 * 60_000;
    if (sameLevelRecent) continue;
    const station = STATIONS.find((s) => s.id === r.stationId);
    if (!station) continue;
    out.push({
      id: `${r.stationId}-${now}-${r.level}`,
      stationId: r.stationId,
      timestamp: now,
      level: r.level,
      message: `${station.name} ${labelFor(r.level)} - 내수위 ${r.innerLevelM.toFixed(2)}m / 외수위 ${r.outerLevelM.toFixed(2)}m`,
      acknowledged: false,
    });
  }
  return out.slice(-200);
}

function labelFor(lvl: AlertLevel): string {
  return lvl === 1 ? '관심' : lvl === 2 ? '주의' : lvl === 3 ? '경계' : lvl === 4 ? '심각' : '정상';
}

export const useAppStore = create<State & Actions>((set, get) => ({
  readings: {},
  alerts: [],
  duty: [],
  online: true,
  cacheAt: null,
  currentTime: Date.now(),
  pushToken: null,
  batteryGuideAck: false,
  currentUser: '당직자',

  hydrate: async () => {
    const [cached, alerts, duty, pushToken, ack] = await Promise.all([
      loadCachedReadings(),
      loadAlerts(),
      loadDuty(),
      loadPushToken(),
      getBatteryGuideAck(),
    ]);
    const live = simulateAll(Date.now());
    const dict: Record<string, LevelReading> = {};
    for (const r of live) dict[r.stationId] = r;
    set({
      readings: dict,
      alerts: alerts.length ? alerts : buildAlertsFromReadings([], live),
      duty: duty.length ? duty : INITIAL_DUTY,
      cacheAt: cached?.at ?? Date.now(),
      pushToken,
      batteryGuideAck: ack,
    });
    await cacheReadings(live);
    if (!duty.length) await saveDuty(INITIAL_DUTY);
  },

  tick: () => {
    const now = Date.now();
    const online = get().online;
    if (!online) {
      set({ currentTime: now });
      return;
    }
    const live = simulateAll(now);
    const dict: Record<string, LevelReading> = {};
    for (const r of live) dict[r.stationId] = r;
    const newAlerts = buildAlertsFromReadings(get().alerts, live);
    set({ readings: dict, alerts: newAlerts, cacheAt: now, currentTime: now });
    cacheReadings(live).catch(() => {});
    saveAlerts(newAlerts).catch(() => {});
  },

  setOnline: (v) => {
    if (!v) {
      // Going offline - keep last-known readings, mark them offline.
      const readings = get().readings;
      const stale: Record<string, LevelReading> = {};
      for (const k of Object.keys(readings)) stale[k] = { ...readings[k], online: false };
      set({ online: false, readings: stale });
    } else {
      set({ online: true });
      get().tick();
    }
  },

  acknowledgeAlert: async (id) => {
    const user = get().currentUser;
    const next = get().alerts.map((a) =>
      a.id === id ? { ...a, acknowledged: true, ackBy: user, ackAt: Date.now() } : a,
    );
    set({ alerts: next });
    await saveAlerts(next);
  },

  upsertDuty: async (d) => {
    const exists = get().duty.some((x) => x.id === d.id);
    const next = exists ? get().duty.map((x) => (x.id === d.id ? d : x)) : [...get().duty, d];
    set({ duty: next });
    await saveDuty(next);
  },

  removeDuty: async (id) => {
    const next = get().duty.filter((d) => d.id !== id);
    set({ duty: next });
    await saveDuty(next);
  },

  setPushToken: async (t) => {
    set({ pushToken: t });
    if (t) await savePushToken(t);
  },

  setBatteryAck: async (v) => {
    set({ batteryGuideAck: v });
    await setBatteryGuideAck(v);
  },

  setCurrentUser: (name) => set({ currentUser: name }),
}));
