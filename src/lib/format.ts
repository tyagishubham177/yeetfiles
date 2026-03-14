export function formatBytes(bytes: number): string {
  if (bytes <= 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  const digits = value >= 100 || exponent === 0 ? 0 : value >= 10 ? 1 : 2;

  return `${value.toFixed(digits)} ${units[exponent]}`;
}

export function formatCompactDate(value: string | null): string {
  if (!value) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatDateTime(value: string | null): string {
  if (!value) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatDimensions(width: number, height: number): string {
  if (width <= 0 || height <= 0) {
    return 'Unknown dimensions';
  }

  return `${width} x ${height}`;
}

export function formatPathContext(uri: string): string {
  if (!uri) {
    return 'Unknown location';
  }

  if (uri.startsWith('content://')) {
    const withoutQuery = uri.split('?')[0] ?? uri;
    const segments = withoutQuery.split('/').filter(Boolean);
    return segments.slice(-3).join(' / ');
  }

  const withoutScheme = uri.replace(/^file:\/\//, '');
  const segments = withoutScheme.split('/').filter(Boolean);

  if (segments.length <= 1) {
    return withoutScheme || uri;
  }

  return segments.slice(Math.max(segments.length - 3, 0), segments.length - 1).join(' / ');
}

export function formatDuration(durationMs: number): string {
  const totalSeconds = Math.max(Math.round(durationMs / 1000), 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes <= 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
}
