export function nowIso(): string {
  return new Date().toISOString();
}

export function durationFrom(startedAt: string | null, endedAt: string = nowIso()): number {
  if (!startedAt) {
    return 0;
  }

  return Math.max(new Date(endedAt).getTime() - new Date(startedAt).getTime(), 0);
}
