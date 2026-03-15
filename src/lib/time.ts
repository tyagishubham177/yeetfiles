export function nowIso(): string {
  return new Date().toISOString();
}

export function durationFrom(startedAt: string | null, endedAt: string = nowIso()): number {
  if (!startedAt) {
    return 0;
  }

  return Math.max(new Date(endedAt).getTime() - new Date(startedAt).getTime(), 0);
}

function toDate(value: Date | string | null | undefined): Date {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string') {
    return new Date(value);
  }

  return new Date();
}

export function toLocalDateKey(value: Date | string | null | undefined = new Date()): string {
  const date = toDate(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getRecentDateKeys(days: number, endingAt: Date | string | null | undefined = new Date()): string[] {
  const anchor = toDate(endingAt);
  const keys: string[] = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const nextDate = new Date(anchor);
    nextDate.setHours(12, 0, 0, 0);
    nextDate.setDate(anchor.getDate() - index);
    keys.push(toLocalDateKey(nextDate));
  }

  return keys;
}

export function isWithinRecentDays(value: string | null | undefined, days: number): boolean {
  if (!value) {
    return false;
  }

  const parsedValue = Date.parse(value);
  if (Number.isNaN(parsedValue)) {
    return false;
  }

  const now = Date.now();
  const diff = now - parsedValue;

  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}
