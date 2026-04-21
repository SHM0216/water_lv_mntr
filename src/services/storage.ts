import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlertEvent, DutyAssignment, LevelReading } from '@/types';

const KEYS = {
  lastReadings: 'wlm:lastReadings',
  alerts: 'wlm:alerts',
  duty: 'wlm:duty',
  pushToken: 'wlm:pushToken',
  batteryGuideAck: 'wlm:batteryGuideAck',
  acks: 'wlm:acknowledgedIds',
};

export async function cacheReadings(readings: LevelReading[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.lastReadings, JSON.stringify({ at: Date.now(), readings }));
}

export async function loadCachedReadings(): Promise<{ at: number; readings: LevelReading[] } | null> {
  const raw = await AsyncStorage.getItem(KEYS.lastReadings);
  return raw ? JSON.parse(raw) : null;
}

export async function saveAlerts(alerts: AlertEvent[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.alerts, JSON.stringify(alerts.slice(-200)));
}

export async function loadAlerts(): Promise<AlertEvent[]> {
  const raw = await AsyncStorage.getItem(KEYS.alerts);
  return raw ? JSON.parse(raw) : [];
}

export async function saveDuty(duty: DutyAssignment[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.duty, JSON.stringify(duty));
}

export async function loadDuty(): Promise<DutyAssignment[]> {
  const raw = await AsyncStorage.getItem(KEYS.duty);
  return raw ? JSON.parse(raw) : [];
}

export async function savePushToken(token: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.pushToken, token);
}

export async function loadPushToken(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.pushToken);
}

export async function setBatteryGuideAck(ack: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.batteryGuideAck, ack ? '1' : '0');
}

export async function getBatteryGuideAck(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEYS.batteryGuideAck)) === '1';
}
