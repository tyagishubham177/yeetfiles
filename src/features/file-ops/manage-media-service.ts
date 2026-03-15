import { Platform } from 'react-native';
import {
  canManageMediaAsync as callDirectDeleteManageMediaCheck,
  deleteAssetsDirectAsync as callDirectDeleteAssets,
  isExpoDirectDeleteModuleAvailable,
  presentManageMediaPermissionPickerAsync as presentDirectDeletePermissionPickerAsync,
} from '../../../modules/expo-direct-delete/src';

export function supportsManageMediaAccess() {
  return Platform.OS === 'android' && typeof Platform.Version === 'number' && Platform.Version >= 31;
}

export function hasNativeDirectDeleteSupport() {
  if (!supportsManageMediaAccess()) {
    return false;
  }

  return isExpoDirectDeleteModuleAvailable;
}

export async function canManageMediaAsync() {
  if (!supportsManageMediaAccess()) {
    return false;
  }

  try {
    return await callDirectDeleteManageMediaCheck();
  } catch {
    return false;
  }
}

export async function presentManageMediaPermissionPickerAsync() {
  if (!supportsManageMediaAccess()) {
    return false;
  }

  try {
    return await presentDirectDeletePermissionPickerAsync();
  } catch {
    return false;
  }
}

export async function deleteAssetsDirectAsync(assetIds: string[]) {
  if (!supportsManageMediaAccess() || assetIds.length === 0) {
    return false;
  }

  return await callDirectDeleteAssets(assetIds);
}