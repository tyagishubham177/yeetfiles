export type BucketType = 'screenshots' | 'camera' | 'downloads' | 'other';
export type FileStatus = 'pending' | 'kept' | 'deleted' | 'skipped' | 'moved' | 'error';
export type FolderFilterType = `folder:${string}`;
export type FilterType = 'all' | BucketType | FolderFilterType;
export type SortMode = 'oldest_first' | 'newest_first' | 'largest_first' | 'random';
export type QuickSessionTarget = 10 | 25 | 50;
export type SessionMode = 'quick10' | 'quick25' | 'quick50' | 'full_queue';
export type PermissionState = 'unknown' | 'granted' | 'limited' | 'denied' | 'blocked';

export type FilterChip = {
  id: FilterType;
  label: string;
  count: number;
};

export type FileItem = {
  id: string;
  nativeAssetId: string;
  albumId?: string | null;
  albumTitle?: string | null;
  uri: string;
  previewUri: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  createdAt: string | null;
  modifiedAt: string | null;
  bucketType: BucketType;
  sortKey: string;
  scanFingerprint: string;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  isNewSinceLastScan: boolean;
  status: FileStatus;
  lastActionAt: string | null;
  lastErrorCode?: string;
};
