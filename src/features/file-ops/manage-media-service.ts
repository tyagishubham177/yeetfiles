import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

type ExpoMediaLibraryManageMediaModule = {
  canManageMediaAsync?: () => Promise<boolean>;
  presentManageMediaPermissionPickerAsync?: () => Promise<boolean>;
};

let nativeModule: ExpoMediaLibraryManageMediaModule | null = null;

function getNativeModule() {
  if (nativeModule) {
    return nativeModule;
  }

  try {
    nativeModule = requireNativeModule<ExpoMediaLibraryManageMediaModule>('ExpoMediaLibrary');
  } catch {
    nativeModule = {};
  }

  return nativeModule;
}

export function supportsManageMediaAccess() {
  return Platform.OS === 'android' && typeof Platform.Version === 'number' && Platform.Version >= 31;
}

export async function canManageMediaAsync() {
  if (!supportsManageMediaAccess()) {
    return false;
  }

  const module = getNativeModule();
  if (!module.canManageMediaAsync) {
    return false;
  }

  try {
    return await module.canManageMediaAsync();
  } catch {
    return false;
  }
}

export async function presentManageMediaPermissionPickerAsync() {
  if (!supportsManageMediaAccess()) {
    return false;
  }

  const module = getNativeModule();
  if (!module.presentManageMediaPermissionPickerAsync) {
    return false;
  }

  try {
    return await module.presentManageMediaPermissionPickerAsync();
  } catch {
    return false;
  }
}
