import * as MediaLibrary from 'expo-media-library';

import type { PermissionState } from '../../types/file-item';

function toPermissionState(response: MediaLibrary.PermissionResponse): PermissionState {
  if (response.granted) {
    return response.accessPrivileges === 'limited' ? 'limited' : 'granted';
  }

  if (response.canAskAgain) {
    return 'denied';
  }

  return 'blocked';
}

export async function getMediaPermissionState(): Promise<PermissionState> {
  const response = await MediaLibrary.getPermissionsAsync(false, ['photo']);
  return toPermissionState(response);
}

export async function requestMediaPermissionState(): Promise<PermissionState> {
  const response = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
  return toPermissionState(response);
}
