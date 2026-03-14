import { File } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

import type { FileItem } from '../../types/file-item';
import { classifyFileBucket } from './bucket-classifier';

export const MEDIA_SCAN_PAGE_SIZE = 100;

type ScanChunkMeta = {
  loaded: number;
  total: number | null;
  hasNextPage: boolean;
};

type ScanArgs = {
  pageSize?: number;
  onChunk: (items: FileItem[], meta: ScanChunkMeta) => void;
};

function inferMimeType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() ?? '';

  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'heic':
      return 'image/heic';
    default:
      return 'image/*';
  }
}

function getSizeBytes(uri: string): number {
  try {
    return new File(uri).size ?? 0;
  } catch {
    return 0;
  }
}

function buildScanFingerprint(asset: MediaLibrary.Asset, sizeBytes: number): string {
  const modifiedAt = asset.modificationTime ?? asset.creationTime ?? 0;
  return [asset.uri, modifiedAt, sizeBytes, asset.filename].join('::');
}

function normalizeAsset(asset: MediaLibrary.Asset, albumTitle: string | null): FileItem {
  const createdAt = asset.creationTime ? new Date(asset.creationTime).toISOString() : null;
  const modifiedAt = asset.modificationTime ? new Date(asset.modificationTime).toISOString() : createdAt;
  const sizeBytes = getSizeBytes(asset.uri);

  return {
    id: `file-${asset.id}`,
    nativeAssetId: asset.id,
    albumId: asset.albumId ?? null,
    albumTitle,
    uri: asset.uri,
    previewUri: asset.uri,
    name: asset.filename,
    mimeType: inferMimeType(asset.filename),
    sizeBytes,
    width: asset.width,
    height: asset.height,
    createdAt,
    modifiedAt,
    bucketType: classifyFileBucket({ filename: asset.filename, uri: asset.uri, albumTitle }),
    sortKey: `${asset.creationTime ?? 0}-${asset.id}`,
    scanFingerprint: buildScanFingerprint(asset, sizeBytes),
    firstSeenAt: null,
    lastSeenAt: null,
    isNewSinceLastScan: false,
    status: 'pending',
    lastActionAt: null,
  };
}

export async function scanPhotoLibrary({ pageSize = MEDIA_SCAN_PAGE_SIZE, onChunk }: ScanArgs): Promise<void> {
  const albums = await MediaLibrary.getAlbumsAsync();
  const albumTitleById = new Map(albums.map((album) => [album.id, album.title]));
  let cursor: string | undefined;
  let loaded = 0;
  let hasNextPage = true;

  while (hasNextPage) {
    const page = await MediaLibrary.getAssetsAsync({
      first: pageSize,
      after: cursor,
      mediaType: MediaLibrary.MediaType.photo,
      sortBy: [[MediaLibrary.SortBy.creationTime, true]],
    });

    const items = page.assets.map((asset) => normalizeAsset(asset, asset.albumId ? albumTitleById.get(asset.albumId) ?? null : null));
    loaded += items.length;
    hasNextPage = page.hasNextPage;
    cursor = page.endCursor ?? undefined;

    onChunk(items, {
      loaded,
      total: page.totalCount ?? null,
      hasNextPage,
    });
  }
}
