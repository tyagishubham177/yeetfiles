import * as MediaLibrary from 'expo-media-library';

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
