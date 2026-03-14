import * as MediaLibrary from 'expo-media-library';

import { nowIso } from '../../lib/time';
import type { MoveTarget } from '../../types/app-state';
import type { FileItem } from '../../types/file-item';

export type MoveFileResult =
  | {
      ok: true;
      action: 'move';
      fileId: string;
      timestamp: string;
      target: MoveTarget;
    }
  | {
      ok: false;
      action: 'move';
      fileId: string;
      errorCode: string;
      message: string;
      target: MoveTarget;
    };

export async function getMoveTargets(): Promise<MoveTarget[]> {
  const albums = await MediaLibrary.getAlbumsAsync();

  return albums
    .filter((album) => album.assetCount > 0 && album.title !== '0')
    .sort((left, right) => right.assetCount - left.assetCount || left.title.localeCompare(right.title))
    .map((album) => ({
      albumId: album.id,
      albumName: album.title,
      label: `${album.title} (${album.assetCount})`,
      assetCount: album.assetCount,
    }));
}

async function resolveTargetAlbum(target: MoveTarget, assetId: string): Promise<MoveTarget> {
  if (target.albumId) {
    await MediaLibrary.addAssetsToAlbumAsync([assetId], target.albumId, false);
    return target;
  }

  const trimmedName = target.albumName.trim();

  if (!trimmedName) {
    throw new Error('Choose an album before confirming the move.');
  }

  const existingAlbum = await MediaLibrary.getAlbumAsync(trimmedName).catch(() => null);

  if (existingAlbum?.id) {
    await MediaLibrary.addAssetsToAlbumAsync([assetId], existingAlbum.id, false);
    return {
      albumId: existingAlbum.id,
      albumName: existingAlbum.title,
      label: existingAlbum.title,
      assetCount: existingAlbum.assetCount,
    };
  }

  const createdAlbum = await MediaLibrary.createAlbumAsync(trimmedName, assetId, false);

  return {
    albumId: createdAlbum.id,
    albumName: createdAlbum.title,
    label: createdAlbum.title,
    assetCount: createdAlbum.assetCount,
    isNew: true,
  };
}

export async function moveFileItem(file: FileItem, target: MoveTarget): Promise<MoveFileResult> {
  if (!file.nativeAssetId) {
    return {
      ok: false,
      action: 'move',
      fileId: file.id,
      errorCode: 'missing_asset_id',
      message: 'This photo no longer has a valid media-library id.',
      target,
    };
  }

  if (target.albumId && file.albumId && target.albumId === file.albumId) {
    return {
      ok: false,
      action: 'move',
      fileId: file.id,
      errorCode: 'same_album',
      message: 'This photo is already in that album.',
      target,
    };
  }

  if (!target.albumId && file.albumTitle && target.albumName.trim().toLowerCase() === file.albumTitle.trim().toLowerCase()) {
    return {
      ok: false,
      action: 'move',
      fileId: file.id,
      errorCode: 'same_album',
      message: 'This photo is already in that album.',
      target,
    };
  }

  try {
    const resolvedTarget = await resolveTargetAlbum(target, file.nativeAssetId);

    return {
      ok: true,
      action: 'move',
      fileId: file.id,
      timestamp: nowIso(),
      target: resolvedTarget,
    };
  } catch (error) {
    return {
      ok: false,
      action: 'move',
      fileId: file.id,
      errorCode: 'move_failed',
      message: error instanceof Error ? error.message : 'The move request failed.',
      target,
    };
  }
}
