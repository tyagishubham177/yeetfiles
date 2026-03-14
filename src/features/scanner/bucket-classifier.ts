import type { BucketType } from '../../types/file-item';

type BucketCandidate = {
  filename: string;
  uri: string;
  albumTitle?: string | null;
};

export function classifyFileBucket({ filename, uri, albumTitle }: BucketCandidate): BucketType {
  const haystack = `${filename} ${uri} ${albumTitle ?? ''}`.toLowerCase();

  if (
    haystack.includes('screenshot') ||
    haystack.includes('screen_shot') ||
    haystack.includes('/screenshots') ||
    haystack.includes('\\screenshots')
  ) {
    return 'screenshots';
  }

  if (haystack.includes('/download') || haystack.includes('\\download') || haystack.includes('download')) {
    return 'downloads';
  }

  if (
    /^(img_|pxl_|mvimg_|dsc_|camera)/.test(filename.toLowerCase()) ||
    haystack.includes('/dcim') ||
    haystack.includes('\\dcim') ||
    haystack.includes('/camera') ||
    haystack.includes('\\camera')
  ) {
    return 'camera';
  }

  return 'other';
}
