import { useColorScheme } from 'react-native';

import { darkColors, lightColors, nightColors } from '../constants/ui-tokens';
import { useAppStore } from '../store/app-store';
import type { NightModePreference, SettingsState } from '../types/app-state';

export type ThemeMode = 'light' | 'dark' | 'night';

function shouldUseNightMode(preference: NightModePreference, systemScheme: 'light' | 'dark' | null): boolean {
  if (preference === 'on') {
    return true;
  }

  if (preference !== 'auto') {
    return false;
  }

  const hour = new Date().getHours();
  return systemScheme === 'dark' || hour >= 20 || hour < 7;
}

export function resolveThemeMode(settings: SettingsState, systemScheme: 'light' | 'dark' | null): ThemeMode {
  if (shouldUseNightMode(settings.nightModePreference, systemScheme)) {
    return 'night';
  }

  if (settings.followSystemTheme && systemScheme === 'dark') {
    return 'dark';
  }

  return 'light';
}

export function useAppTheme() {
  const settings = useAppStore((state) => state.settings);
  const systemScheme = useColorScheme() ?? null;
  const mode = resolveThemeMode(settings, systemScheme);
  const colors = mode === 'night' ? nightColors : mode === 'dark' ? darkColors : lightColors;

  return {
    colors,
    isDark: mode !== 'light',
    isNightMode: mode === 'night',
    mode,
    systemScheme,
  };
}
