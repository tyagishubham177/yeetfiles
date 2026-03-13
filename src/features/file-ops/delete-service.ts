import * as MediaLibrary from 'expo-media-library';

import { nowIso } from '../../lib/time';
import type { FileItem } from '../../types/file-item';

export type FileOpResult =
  | { ok: true; action: 'delete'; fileId: string; timestamp: string }
  | { ok: false; action: 'delete'; fileId: string; errorCode: string; message: string };

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
    return {
      ok: false,
      action: 'delete',
      fileId: file.id,
      errorCode: 'delete_failed',
      message: error instanceof Error ? error.message : 'The delete request failed.',
    };
  }
}
