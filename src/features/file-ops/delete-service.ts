import * as MediaLibrary from 'expo-media-library';

import { canManageMediaAsync, deleteAssetsDirectAsync, hasNativeDirectDeleteSupport } from './manage-media-service';
import { nowIso } from '../../lib/time';
import type { FileItem } from '../../types/file-item';

export type FileOpResult =
  | { ok: true; action: 'delete'; fileId: string; timestamp: string }
  | { ok: false; action: 'delete'; fileId: string; errorCode: string; message: string };

function normalizeDeleteError(error: unknown) {
  if (!(error instanceof Error)) {
    return {
      errorCode: 'delete_failed',
      message: 'The delete request failed.',
    };
  }

  const normalizedMessage = error.message.toLowerCase();

  if (
    normalizedMessage.includes("didn't grant write permission") ||
    normalizedMessage.includes('did not grant write permission') ||
    normalizedMessage.includes('user cancelled') ||
    normalizedMessage.includes('user canceled') ||
    normalizedMessage.includes('cancelled') ||
    normalizedMessage.includes('canceled')
  ) {
    return {
      errorCode: 'delete_cancelled',
      message: 'Delete was cancelled in the system confirmation.',
    };
  }

  if (normalizedMessage.includes('direct delete is unavailable')) {
    return {
      errorCode: 'direct_delete_unavailable',
      message: 'Direct delete is not available in this installed build yet. Install the latest dev build and try again.',
    };
  }

  return {
    errorCode: 'delete_failed',
    message: error.message,
  };
}

export async function deleteFileItem(file: FileItem): Promise<FileOpResult> {
  if (!file.nativeAssetId) {
    return {
      ok: false,
      action: 'delete',
      fileId: file.id,
      errorCode: 'missing_asset_id',
      message: 'This photo no longer has a valid media-library id.',
    };
  }

  try {
    const canUseDirectDelete = hasNativeDirectDeleteSupport() && (await canManageMediaAsync());

    if (canUseDirectDelete) {
      try {
        const deleted = await deleteAssetsDirectAsync([file.nativeAssetId]);
        if (deleted) {
          return {
            ok: true,
            action: 'delete',
            fileId: file.id,
            timestamp: nowIso(),
          };
        }
      } catch {
        // Fall through to the platform delete flow if the direct path declines the asset.
      }
    }

    await MediaLibrary.deleteAssetsAsync([file.nativeAssetId]);

    return {
      ok: true,
      action: 'delete',
      fileId: file.id,
      timestamp: nowIso(),
    };
  } catch (error) {
    const normalizedError = normalizeDeleteError(error);

    return {
      ok: false,
      action: 'delete',
      fileId: file.id,
      errorCode: normalizedError.errorCode,
      message: normalizedError.message,
    };
  }
}
