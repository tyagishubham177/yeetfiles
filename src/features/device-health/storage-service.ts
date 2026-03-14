import * as FileSystem from 'expo-file-system/legacy';

export type StorageCheckResult = {
  freeBytes: number;
  totalBytes: number;
  thresholdBytes: number;
  belowThreshold: boolean;
};

const MIN_LOW_STORAGE_BYTES = 1.5 * 1024 * 1024 * 1024;
const LOW_STORAGE_RATIO = 0.08;

export async function checkDeviceStorageAsync(): Promise<StorageCheckResult> {
  const [freeBytes, totalBytes] = await Promise.all([
    FileSystem.getFreeDiskStorageAsync(),
    FileSystem.getTotalDiskCapacityAsync(),
  ]);

  const thresholdBytes = Math.max(MIN_LOW_STORAGE_BYTES, Math.floor(totalBytes * LOW_STORAGE_RATIO));

  return {
    freeBytes,
    totalBytes,
    thresholdBytes,
    belowThreshold: freeBytes <= thresholdBytes,
  };
}
