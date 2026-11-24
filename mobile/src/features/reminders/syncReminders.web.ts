import type { PlannedReminder } from '../../domain/reminders';
import type { Project, ReviewState, Settings, Task } from '../../domain/types';

export async function requestReminderPermission(): Promise<boolean> {
  return false;
}

export async function syncDeviceReminders(_input: {
  tasks: Task[];
  settings: Settings;
  review: ReviewState;
  projects: Project[];
}): Promise<number> {
  return 0;
}

export function addReminderResponseListener(_onAction: (action: string, reminder: PlannedReminder) => void) {
  return { remove() {} };
}
