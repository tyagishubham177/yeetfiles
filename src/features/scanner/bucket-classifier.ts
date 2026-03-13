import type { BucketType } from '../../types/file-item';

type BucketCandidate = {
  filename: string;
  uri: string;
};

export function classifyFileBucket({ filename, uri }: BucketCandidate): BucketType {
  const haystack = `${filename} ${uri}`.toLowerCase();

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

  if (/^(img_|pxl_|mvimg_|dsc_|camera)/.test(filename.toLowerCase())) {
    return 'camera';
  }

  return 'other';
}
