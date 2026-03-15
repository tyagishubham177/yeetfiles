import { requireOptionalNativeModule } from 'expo';

type ExpoDirectDeleteModule = {
  canManageMediaAsync?: () => Promise<boolean>;
  presentManageMediaPermissionPickerAsync?: () => Promise<boolean>;
  deleteAssetsDirectAsync?: (assetIds: string[]) => Promise<boolean>;
};

const nativeModule = requireOptionalNativeModule<ExpoDirectDeleteModule>('ExpoDirectDelete');

export const isExpoDirectDeleteModuleAvailable = Boolean(nativeModule);

export function canManageMediaAsync() {
  return nativeModule?.canManageMediaAsync?.() ?? Promise.resolve(false);
}

export function presentManageMediaPermissionPickerAsync() {
  return nativeModule?.presentManageMediaPermissionPickerAsync?.() ?? Promise.resolve(false);
}

export function deleteAssetsDirectAsync(assetIds: string[]) {
  return nativeModule?.deleteAssetsDirectAsync?.(assetIds) ?? Promise.resolve(false);
}