import { useColorScheme } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { getTheme, ResolvedMode, Theme, ThemeMode } from '.';

export function useResolvedMode(): ResolvedMode {
  const mode = useAppStore((s) => s.themeMode);
  const system = useColorScheme();
  if (mode === 'system') return system === 'dark' ? 'dark' : 'light';
  return mode;
}

export function useTheme(): Theme {
  const resolved = useResolvedMode();
  return getTheme(resolved);
}

export function useThemeMode(): {
  mode: ThemeMode;
  resolved: ResolvedMode;
  setMode: (m: ThemeMode) => Promise<void>;
} {
  const mode = useAppStore((s) => s.themeMode);
  const setMode = useAppStore((s) => s.setThemeMode);
  const resolved = useResolvedMode();
  return { mode, resolved, setMode };
}
