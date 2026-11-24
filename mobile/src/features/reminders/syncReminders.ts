import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { planReminders, type PlannedReminder } from '../../domain/reminders';
import type { Project, ReviewState, Settings, Task } from '../../domain/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestReminderPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

export async function syncDeviceReminders(input: {
  tasks: Task[];
  settings: Settings;
  review: ReviewState;
  projects: Project[];
}): Promise<number> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('sorted-quiet', {
      name: 'Sorted gentle reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 80],
      lightColor: '#4A7C9B',
    });
  }
  await Notifications.setNotificationCategoryAsync('sorted-task', [
    { identifier: 'done', buttonTitle: 'Done', options: { opensAppToForeground: true } },
    { identifier: 'snooze', buttonTitle: 'Snooze', options: { opensAppToForeground: false } },
    { identifier: 'reschedule', buttonTitle: 'New time', options: { opensAppToForeground: true } },
    { identifier: 'move', buttonTitle: 'Place', options: { opensAppToForeground: true } },
  ]);
  const plan = planReminders(input.tasks, input.settings, input.review, input.projects);
  await Notifications.cancelAllScheduledNotificationsAsync();
  let count = 0;
  for (const item of plan) {
    const date = new Date(item.fireAt);
    if (date.getTime() <= Date.now() + 2000) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: item.id.replace(/[^a-zA-Z0-9:_-]/g, '').slice(0, 64),
      content: {
        title: item.title,
        body: item.body,
        categoryIdentifier: 'sorted-task',
        data: item,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: 'sorted-quiet',
      },
    });
    count += 1;
  }
  return count;
}

export function addReminderResponseListener(onAction: (action: string, reminder: PlannedReminder) => void) {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const reminder = response.notification.request.content.data as PlannedReminder;
    const action = response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER ? 'move' : response.actionIdentifier;
    onAction(action, reminder);
  });
}
