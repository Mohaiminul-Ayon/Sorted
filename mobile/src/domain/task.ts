import { ENERGIES, TASK_STATES, type Task, type TaskState } from './types';

export const localDay = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function validateSchedule(task: Pick<Task, 'start' | 'duration' | 'energy'>): string {
  if (!task.start || !Number.isFinite(new Date(task.start).getTime())) return 'Choose a start date and time.';
  if (!Number.isFinite(Number(task.duration)) || Number(task.duration) <= 0) return 'Add a duration greater than zero.';
  if (!task.energy || !ENERGIES.includes(task.energy)) return 'Choose an energy level.';
  return '';
}

export function createTask(title: string, fields: Partial<Task> = {}): Task {
  if (!title.trim()) throw new Error('Give your task a title.');
  const now = new Date().toISOString();
  return {
    id: fields.id ?? crypto.randomUUID(),
    title: title.trim(),
    originalText: fields.originalText ?? title.trim(),
    source: fields.source ?? 'typed',
    sourceApp: fields.sourceApp ?? null,
    priority: fields.priority ?? 'Normal',
    state: 'Inbox',
    projectId: fields.projectId ?? null,
    meetingId: fields.meetingId ?? null,
    start: null,
    duration: null,
    energy: null,
    prerequisiteNote: fields.prerequisiteNote ?? null,
    calendarEventId: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    deleted: false,
    history: [],
    reschedules: [],
  };
}

export function transition(task: Task, state: TaskState, fields: Partial<Task> & { reason?: string } = {}): Task {
  if (!TASK_STATES.includes(state)) throw new Error('Unknown category.');
  const { reason, ...rest } = fields;
  const next: Task = { ...task, ...rest, title: (rest.title ?? task.title).trim(), state };
  if (!next.title) throw new Error('Give your task a title.');
  if (state === 'Schedule now') {
    const error = validateSchedule(next);
    if (error) throw new Error(error);
  }
  const now = new Date().toISOString();
  const rescheduled =
    task.state === 'Schedule now' &&
    state !== 'Done' &&
    (state !== 'Schedule now' || task.start !== next.start);
  return {
    ...next,
    updatedAt: now,
    completedAt: state === 'Done' ? now : null,
    history: [...task.history, { from: task.state, to: state, time: now }],
    reschedules: rescheduled
      ? [
          ...task.reschedules,
          {
            oldSlot: task.start,
            newSlot: state === 'Schedule now' ? next.start : null,
            reason: reason || 'Reprioritised',
            time: now,
          },
        ]
      : task.reschedules,
  };
}

export const needsAttention = (task: Task, now = Date.now()) =>
  !task.deleted &&
  task.state === 'Schedule now' &&
  task.start != null &&
  task.duration != null &&
  new Date(task.start).getTime() + Number(task.duration) * 60000 < now;

export function reviewTasks(tasks: Task[], sessions: number, sessionIds: string[] | null = null): Task[] {
  const sorted = tasks.filter((t) => !t.deleted && t.state === 'Important').sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (sessionIds) return sorted.filter((t) => sessionIds.includes(t.id));
  return sessions < 3 ? sorted : sorted.slice(0, 20);
}
