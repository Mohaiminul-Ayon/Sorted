import type { Task } from '../../domain/types';

export async function upsertTaskCalendarEvent(_task: Task): Promise<string> {
  throw new Error('Device calendar is available in the Android app, not this browser preview.');
}
