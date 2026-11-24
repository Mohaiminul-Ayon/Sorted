import type { Settings } from './types';

export function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function clockToMinutes(clock: string): number {
  const [hours, minutes] = clock.split(':').map(Number);
  return hours * 60 + minutes;
}

export function atClock(day: Date, clock: string): Date {
  const next = new Date(day);
  const [hours, minutes] = clock.split(':').map(Number);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

export function isQuietHours(date: Date, settings: Settings): boolean {
  const time = minutesOfDay(date);
  const start = clockToMinutes(settings.quietStart);
  const end = clockToMinutes(settings.quietEnd);
  if (start === end) return false;
  if (start < end) return time >= start && time < end;
  return time >= start || time < end;
}

export function isWorkingHours(date: Date, settings: Settings): boolean {
  const time = minutesOfDay(date);
  return time >= clockToMinutes(settings.workStart) && time < clockToMinutes(settings.workEnd);
}

export function shiftOutOfQuiet(date: Date, settings: Settings): Date {
  if (!isQuietHours(date, settings)) return new Date(date);
  const next = atClock(date, settings.quietEnd);
  if (next <= date) next.setDate(next.getDate() + 1);
  return next;
}

export const WEEKDAY_INDEX: Record<Settings['weekend'], number> = {
  Sunday: 0,
  Friday: 5,
  Saturday: 6,
};

export function nextWeekendMorning(now: Date, settings: Settings): Date {
  const target = WEEKDAY_INDEX[settings.weekend];
  const next = atClock(now, '10:00');
  const delta = (target - now.getDay() + 7) % 7;
  if (delta === 0 && next <= now) next.setDate(next.getDate() + 7);
  else next.setDate(next.getDate() + delta);
  return shiftOutOfQuiet(next, settings);
}
