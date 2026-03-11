import * as MediaLibrary from 'expo-media-library';

import type { PermissionState } from '../../types/file-item';

export const MEDIA_PERMISSION_BLOCKED_HELP =
  'If you are testing in Expo Go on Android, photo-library permission is blocked there. Use a development build for real media access, or open system Settings if you denied the permission permanently.';

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
  try {
    const response = await MediaLibrary.getPermissionsAsync(false, ['photo']);
    return toPermissionState(response);
  } catch {
    return 'blocked';
  }
}

export async function requestMediaPermissionState(): Promise<PermissionState> {
  try {
    const response = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
    return toPermissionState(response);
  } catch {
    return 'blocked';
  }
}
