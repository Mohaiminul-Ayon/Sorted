import type { Task } from './types';

export function calendarEventDraft(task: Task): { title: string; start: Date; end: Date } | null {
  if (task.state !== 'Schedule now' || !task.start || !task.duration) return null;
  const start = new Date(task.start);
  if (!Number.isFinite(start.getTime())) return null;
  return {
    title: task.title,
    start,
    end: new Date(start.getTime() + Number(task.duration) * 60 * 1000),
  };
}

export function withCalendarEvent(task: Task, eventId: string | null): Task {
  return { ...task, calendarEventId: eventId, updatedAt: new Date().toISOString() };
}
