import { useEffect } from 'react';
import { useApp, snoozeTaskStart } from '../../shell/AppContext';
import { addReminderResponseListener } from './syncReminders';
import { snoozeUntil } from '../../domain/reminders';

export function ReminderBridge() {
  const { tasks, placeTask, skipInboxUntil, openTask } = useApp();

  useEffect(() => {
    const sub = addReminderResponseListener((action, reminder) => {
      const task = reminder.taskId ? tasks.find((item) => item.id === reminder.taskId) : null;
      void (async () => {
        if (action === 'snooze' && reminder.kind === 'inbox') {
          await skipInboxUntil(snoozeUntil(new Date(), 60).toISOString());
          return;
        }
        if (!task) return;
        if (action === 'done') await placeTask(task, 'Done');
        if (action === 'snooze') await placeTask(task, task.state, snoozeTaskStart(task));
        if (action === 'reschedule' || action === 'move') openTask(task);
      })();
    });
    return () => sub.remove();
  }, [openTask, placeTask, skipInboxUntil, tasks]);

  return null;
}
