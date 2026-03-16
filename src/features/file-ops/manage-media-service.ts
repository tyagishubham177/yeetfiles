import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';
import {
  canManageMediaAsync as callDirectDeleteManageMediaCheck,
  deleteAssetsDirectAsync as callDirectDeleteAssets,
  isExpoDirectDeleteModuleAvailable,
  presentManageMediaPermissionPickerAsync as presentDirectDeletePermissionPickerAsync,
} from '../../../modules/expo-direct-delete/src';

type ExpoMediaLibraryManageMediaModule = {
  canManageMediaAsync?: () => Promise<boolean>;
  presentManageMediaPermissionPickerAsync?: () => Promise<boolean>;
  deleteAssetsDirectAsync?: (assetIds: string[]) => Promise<boolean>;
};

const expoMediaLibraryManageMediaModule =
  requireOptionalNativeModule<ExpoMediaLibraryManageMediaModule>('ExpoMediaLibrary');

function hasExpoMediaLibraryDirectDeleteSupport() {
  return typeof expoMediaLibraryManageMediaModule?.deleteAssetsDirectAsync === 'function';
}

export function supportsManageMediaAccess() {
  return Platform.OS === 'android' && typeof Platform.Version === 'number' && Platform.Version >= 31;
}

export function hasNativeDirectDeleteSupport() {
  if (!supportsManageMediaAccess()) {
    return false;
  }

  return isExpoDirectDeleteModuleAvailable || hasExpoMediaLibraryDirectDeleteSupport();
}

export async function canManageMediaAsync() {
  if (!supportsManageMediaAccess()) {
    return false;
  }

  try {
    if (isExpoDirectDeleteModuleAvailable) {
      return await callDirectDeleteManageMediaCheck();
    }

    return (await expoMediaLibraryManageMediaModule?.canManageMediaAsync?.()) ?? false;
  } catch {
    return false;
  }
}

export async function presentManageMediaPermissionPickerAsync() {
  if (!supportsManageMediaAccess()) {
    return false;
  }

  try {
    if (isExpoDirectDeleteModuleAvailable) {
      return await presentDirectDeletePermissionPickerAsync();
    }

    return (await expoMediaLibraryManageMediaModule?.presentManageMediaPermissionPickerAsync?.()) ?? false;
  } catch {
    return false;
  }
}

export async function deleteAssetsDirectAsync(assetIds: string[]) {
  if (!supportsManageMediaAccess() || assetIds.length === 0) {
    return false;
  }

  if (isExpoDirectDeleteModuleAvailable) {
    return await callDirectDeleteAssets(assetIds);
  }

  return (await expoMediaLibraryManageMediaModule?.deleteAssetsDirectAsync?.(assetIds)) ?? false;
}
