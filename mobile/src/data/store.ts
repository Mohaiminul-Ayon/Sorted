import type { Meeting, Project, ReviewState, Settings, Task } from '../domain/types';
import { DEFAULT_REVIEW, DEFAULT_SETTINGS, normalizeReview } from '../domain/types';
import { parseJsonRecord } from '../domain/parse';
import { getDatabase } from './database';

export async function loadSnapshot(): Promise<{
  tasks: Task[];
  projects: Project[];
  meetings: Meeting[];
  settings: Settings;
  review: ReviewState;
  schemaVersion: number;
  lastOpenedAt: string | null;
}> {
  const db = await getDatabase();
  const taskRows = await db.getAllAsync<{ json: string }>('SELECT json FROM tasks');
  const projectRows = await db.getAllAsync<{ json: string }>('SELECT json FROM projects');
  const meetingRows = await db.getAllAsync<{ json: string }>('SELECT json FROM meetings');
  const settingsRow = await db.getFirstAsync<{ json: string }>('SELECT json FROM settings WHERE id = 1');
  const reviewRow = await db.getFirstAsync<{ value: string }>('SELECT value FROM meta WHERE key = ?', ['review']);
  const schemaRow = await db.getFirstAsync<{ value: string }>('SELECT value FROM meta WHERE key = ?', ['schemaVersion']);
  const openedRow = await db.getFirstAsync<{ value: string }>('SELECT value FROM meta WHERE key = ?', ['lastOpenedAt']);

  const settings = settingsRow ? parseJsonRecord<Settings>(settingsRow.json, 'settings') : null;
  if (!settingsRow || !settings) {
    await saveSettings(DEFAULT_SETTINGS);
  }

  return {
    tasks: taskRows.map((r) => parseJsonRecord<Task>(r.json, 'task')).filter((t): t is Task => t != null && typeof t.id === 'string'),
    projects: projectRows.map((r) => parseJsonRecord<Project>(r.json, 'project')).filter((p): p is Project => p != null && typeof p.id === 'string'),
    meetings: meetingRows.map((r) => parseJsonRecord<Meeting>(r.json, 'meeting')).filter((m): m is Meeting => m != null && typeof m.id === 'string'),
    settings: settings ? { ...DEFAULT_SETTINGS, ...settings } : DEFAULT_SETTINGS,
    review: normalizeReview(reviewRow ? parseJsonRecord<ReviewState>(reviewRow.value, 'review') : DEFAULT_REVIEW),
    schemaVersion: schemaRow ? Number(schemaRow.value) : 0,
    lastOpenedAt: openedRow?.value ?? null,
  };
}

export async function upsertTask(task: Task): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO tasks (id, json, deleted, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET json = excluded.json, deleted = excluded.deleted, updated_at = excluded.updated_at',
    [task.id, JSON.stringify(task), task.deleted ? 1 : 0, task.updatedAt],
  );
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('INSERT INTO settings (id, json) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET json = excluded.json', [
    JSON.stringify(settings),
  ]);
}

export async function saveReview(review: ReviewState): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [
    'review',
    JSON.stringify(review),
  ]);
}

export async function upsertProject(project: Project): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO projects (id, json, deleted, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET json = excluded.json, deleted = excluded.deleted, updated_at = excluded.updated_at',
    [project.id, JSON.stringify(project), project.deleted ? 1 : 0, project.updatedAt],
  );
}

export async function upsertMeeting(meeting: Meeting): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO meetings (id, json, deleted, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET json = excluded.json, deleted = excluded.deleted, updated_at = excluded.updated_at',
    [meeting.id, JSON.stringify(meeting), meeting.deleted ? 1 : 0, meeting.updatedAt],
  );
}
