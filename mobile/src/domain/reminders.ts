import type { Project, ReviewState, Settings, Task } from './types';
import { localDay } from './task';
import { atClock, isWorkingHours, nextWeekendMorning, shiftOutOfQuiet } from './clock';
import { somedayIsDue } from './reviewSession';

export type ReminderKind = 'slot' | 'inbox' | 'review' | 'evening' | 'calendar-nudge' | 'someday';
export type ReminderAction = 'done' | 'snooze' | 'reschedule' | 'move';

export type PlannedReminder = {
  id: string;
  kind: ReminderKind;
  fireAt: string;
  title: string;
  body: string;
  taskId: string | null;
  actions: ReminderAction[];
};

const INBOX_HOURS = ['10:00', '14:00', '18:00'] as const;

function workRelated(task: Task, projects: Project[]): boolean {
  const project = projects.find((p) => p.id === task.projectId);
  return project?.context === 'Work';
}

function applyHours(date: Date, task: Task | null, projects: Project[], settings: Settings, respectQuiet: boolean): Date {
  let next = new Date(date);
  if (respectQuiet) next = shiftOutOfQuiet(next, settings);
  if (task && workRelated(task, projects) && !isWorkingHours(next, settings)) {
    const start = atClock(next, settings.workStart);
    if (start <= next) start.setDate(start.getDate() + 1);
    next = shiftOutOfQuiet(atClock(start, settings.workStart), settings);
  }
  return next;
}

export function planReminders(
  tasks: Task[],
  settings: Settings,
  review: ReviewState,
  projects: Project[],
  now = new Date(),
): PlannedReminder[] {
  if (!settings.notificationsEnabled) return [];
  const day = localDay(now);
  const planned: PlannedReminder[] = [];
  const inboxOpen = tasks.filter((t) => !t.deleted && t.state === 'Inbox');
  const skipInbox = settings.inboxSkipUntil != null && new Date(settings.inboxSkipUntil).getTime() > now.getTime();

  if (inboxOpen.length && !skipInbox) {
    for (const clock of INBOX_HOURS) {
      const fire = applyHours(atClock(now, clock), null, projects, settings, true);
      if (fire <= now) continue;
      planned.push({
        id: `inbox:${day}:${clock}`,
        kind: 'inbox',
        fireAt: fire.toISOString(),
        title: 'A little inbox still waiting',
        body: `${inboxOpen.length} thought${inboxOpen.length === 1 ? '' : 's'} to place when you have a moment.`,
        taskId: null,
        actions: ['snooze', 'move'],
      });
    }
  }

  for (const task of tasks.filter((t) => !t.deleted && t.state === 'Schedule now' && t.start)) {
    const start = new Date(task.start as string);
    if (!Number.isFinite(start.getTime()) || start <= now) continue;
    const fire = applyHours(start, task, projects, settings, true);
    planned.push({
      id: `slot:${task.id}:${task.start}`,
      kind: 'slot',
      fireAt: fire.toISOString(),
      title: task.title,
      body: 'This is the time you set aside.',
      taskId: task.id,
      actions: ['done', 'snooze', 'reschedule', 'move'],
    });
    if (!task.calendarEventId && start.toDateString() === now.toDateString()) {
      const nudge = applyHours(atClock(now, settings.workStart), task, projects, settings, true);
      if (nudge > now) {
        planned.push({
          id: `calendar:${task.id}:${day}`,
          kind: 'calendar-nudge',
          fireAt: nudge.toISOString(),
          title: 'Add this to your calendar?',
          body: task.title,
          taskId: task.id,
          actions: ['move'],
        });
      }
    }
  }

  const evening = applyHours(atClock(now, settings.quietStart), null, projects, settings, false);
  const eveningFire = shiftOutOfQuiet(evening.getTime() <= now.getTime() ? new Date(evening.getTime() + 24 * 60 * 60 * 1000) : evening, settings);
  if (eveningFire > now) {
    const doneToday = tasks.filter((t) => t.state === 'Done' && t.completedAt?.startsWith(day)).length;
    const waiting = inboxOpen.length;
    const attention = tasks.filter((t) => !t.deleted && t.state === 'Schedule now' && t.start && new Date(t.start).getTime() + Number(t.duration) * 60000 < now.getTime()).length;
    planned.push({
      id: `evening:${day}`,
      kind: 'evening',
      fireAt: eveningFire.toISOString(),
      title: 'Today, gently reflected',
      body: `${doneToday} done · ${waiting} to place · ${attention} to revisit.`,
      taskId: null,
      actions: ['move'],
    });
  }

  const reviewAt = nextWeekendMorning(now, settings);
  if (reviewAt > now) {
    planned.push({
      id: `review:${localDay(reviewAt)}`,
      kind: 'review',
      fireAt: reviewAt.toISOString(),
      title: 'A little weekly space',
      body: `Your ${settings.weekend} review is ready when you are.`,
      taskId: null,
      actions: ['snooze', 'move'],
    });
  }

  if (somedayIsDue(review, now)) {
    const fire = applyHours(atClock(now, settings.workStart), null, projects, settings, true);
    if (fire > now) {
      planned.push({
        id: `someday:${day}`,
        kind: 'someday',
        fireAt: fire.toISOString(),
        title: 'Someday items could use a look',
        body: 'Keep, bring closer, or let a few go.',
        taskId: null,
        actions: ['snooze', 'move'],
      });
    }
  }

  return planned.filter((item, index, all) => all.findIndex((other) => other.id === item.id) === index);
}

export function snoozeUntil(from: Date, minutes = 15): Date {
  return new Date(from.getTime() + minutes * 60 * 1000);
}
