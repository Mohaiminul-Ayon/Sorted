export function parseJsonRecord<T>(json: string, label: string): T | null {
  try {
    const value: unknown = JSON.parse(json);
    if (value === null || typeof value !== 'object') return null;
    return value as T;
  } catch {
    console.warn(`Skipped unreadable ${label} record.`);
    return null;
  }
}

export function isClock(value: string): boolean {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return false;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}
