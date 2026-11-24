import * as Calendar from 'expo-calendar';
import type { Task } from '../../domain/types';
import { calendarEventDraft } from '../../domain/calendarEvent';

export async function upsertTaskCalendarEvent(task: Task): Promise<string> {
  const permission = await Calendar.requestCalendarPermissionsAsync();
  if (permission.status !== 'granted') throw new Error('Calendar access is asked only when you add this plan.');
  const draft = calendarEventDraft(task);
  if (!draft) throw new Error('Give this task a start time and duration first.');
  if (task.calendarEventId) {
    try {
      await Calendar.updateEventAsync(task.calendarEventId, {
        title: draft.title,
        startDate: draft.start,
        endDate: draft.end,
        notes: task.originalText,
      });
      return task.calendarEventId;
    } catch {
      /* deleted on device: recreate (labeled default for BRD open #5) */
    }
  }
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const writable = calendars.find((entry) => entry.allowsModifications) ?? calendars[0];
  if (!writable) throw new Error('This device has no writable calendar.');
  return Calendar.createEventAsync(writable.id, {
    title: draft.title,
    startDate: draft.start,
    endDate: draft.end,
    notes: task.originalText,
  });
}
