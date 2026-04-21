import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AlertLevel } from '@/types';

let activeLevel: AlertLevel | null = null;
let webAudioCtx: AudioContext | null = null;
let webOscTimer: ReturnType<typeof setInterval> | null = null;
let hapticTimer: ReturnType<typeof setInterval> | null = null;

const VIBRATION_PATTERNS: Record<AlertLevel, number[]> = {
  0: [],
  1: [0, 200, 800],
  2: [0, 250, 250, 250, 500],
  3: [0, 350, 200, 350, 200, 350, 400],
  4: [0, 500, 250, 500, 250, 500, 250, 500, 300],
};

export async function startAlarm(level: AlertLevel): Promise<void> {
  if (level === 0) {
    await stopAlarm();
    return;
  }
  if (activeLevel === level) return;
  await stopAlarm();
  activeLevel = level;

  if (Platform.OS === 'web') {
    playWebTone(level);
    return;
  }

  const pattern = VIBRATION_PATTERNS[level];
  if (pattern.length > 0) Vibration.vibrate(pattern, true);
  if (level >= 3) {
    const kind =
      level === 4
        ? Haptics.NotificationFeedbackType.Error
        : Haptics.NotificationFeedbackType.Warning;
    Haptics.notificationAsync(kind).catch(() => {});
    const periodMs = level === 4 ? 1200 : 1800;
    hapticTimer = setInterval(() => {
      Haptics.notificationAsync(kind).catch(() => {});
    }, periodMs);
  }
}

export async function stopAlarm(): Promise<void> {
  activeLevel = null;
  if (hapticTimer) {
    clearInterval(hapticTimer);
    hapticTimer = null;
  }
  if (Platform.OS === 'web') {
    stopWebTone();
    return;
  }
  Vibration.cancel();
}

function playWebTone(level: AlertLevel) {
  if (typeof window === 'undefined') return;
  const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!Ctx) return;
  try {
    webAudioCtx = new Ctx();
    const freqs: Record<AlertLevel, number[]> = {
      0: [],
      1: [660],
      2: [660, 880],
      3: [880, 660, 880],
      4: [988, 740, 988, 740],
    };
    const pattern = freqs[level];
    if (pattern.length === 0) return;
    let idx = 0;
    const tick = () => {
      if (!webAudioCtx) return;
      const f = pattern[idx % pattern.length];
      idx++;
      const osc = webAudioCtx.createOscillator();
      const gain = webAudioCtx.createGain();
      osc.frequency.value = f;
      osc.type = 'square';
      gain.gain.setValueAtTime(0, webAudioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(level === 4 ? 0.18 : 0.12, webAudioCtx.currentTime + 0.02);
      gain.gain.linearRampToValueAtTime(0, webAudioCtx.currentTime + 0.28);
      osc.connect(gain).connect(webAudioCtx.destination);
      osc.start();
      osc.stop(webAudioCtx.currentTime + 0.3);
    };
    tick();
    const intervalMs = level === 4 ? 350 : level === 3 ? 500 : level === 2 ? 750 : 1200;
    webOscTimer = setInterval(tick, intervalMs);
  } catch {}
}

function stopWebTone() {
  if (webOscTimer) {
    clearInterval(webOscTimer);
    webOscTimer = null;
  }
  if (webAudioCtx) {
    try {
      webAudioCtx.close();
    } catch {}
    webAudioCtx = null;
  }
}
