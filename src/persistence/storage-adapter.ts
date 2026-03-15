import { asyncStorage } from './async-storage';

export const APP_STORAGE_KEY = 'yeetfiles-store';
export const LEGACY_APP_STORAGE_KEYS = ['yeetfiles-phase0-store'] as const;

export async function getStoredAppState(): Promise<string | null> {
  const currentValue = await asyncStorage.getItem(APP_STORAGE_KEY);
  if (currentValue) {
    return currentValue;
  }

  for (const legacyKey of LEGACY_APP_STORAGE_KEYS) {
    const legacyValue = await asyncStorage.getItem(legacyKey);
    if (legacyValue) {
      return legacyValue;
    }
  }

  return null;
}

export async function setStoredAppState(value: string): Promise<void> {
  await asyncStorage.setItem(APP_STORAGE_KEY, value);
}

export async function clearStoredAppState(): Promise<void> {
  await Promise.all([APP_STORAGE_KEY, ...LEGACY_APP_STORAGE_KEYS].map((storageKey) => asyncStorage.removeItem(storageKey)));
}
