import type { Meeting, Project, ReviewState, Settings, Task } from '../domain/types';
import { DEFAULT_SETTINGS } from '../domain/types';
import { getDatabase } from './database';

const parse = <T>(json: string): T => JSON.parse(json) as T;

export async function loadSnapshot(): Promise<{
  tasks: Task[];
  projects: Project[];
  meetings: Meeting[];
  settings: Settings;
  review: ReviewState;
}> {
  const db = await getDatabase();
  const taskRows = await db.getAllAsync<{ json: string }>('SELECT json FROM tasks');
  const projectRows = await db.getAllAsync<{ json: string }>('SELECT json FROM projects');
  const meetingRows = await db.getAllAsync<{ json: string }>('SELECT json FROM meetings');
  const settingsRow = await db.getFirstAsync<{ json: string }>('SELECT json FROM settings WHERE id = 1');
  const reviewRow = await db.getFirstAsync<{ value: string }>('SELECT value FROM meta WHERE key = ?', ['review']);
  return {
    tasks: taskRows.map((r) => parse<Task>(r.json)),
    projects: projectRows.map((r) => parse<Project>(r.json)),
    meetings: meetingRows.map((r) => parse<Meeting>(r.json)),
    settings: settingsRow ? parse<Settings>(settingsRow.json) : DEFAULT_SETTINGS,
    review: reviewRow ? parse<ReviewState>(reviewRow.value) : { sessions: 0, startedAt: null },
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
