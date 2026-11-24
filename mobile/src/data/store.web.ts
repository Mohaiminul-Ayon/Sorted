import type { Meeting, Project, ReviewState, Settings, Task } from '../domain/types';
import { readWebSnapshot, writeWebSnapshot } from './webStore';

export async function loadSnapshot() {
  const snap = readWebSnapshot();
  writeWebSnapshot(snap);
  return snap;
}

export async function upsertTask(task: Task): Promise<void> {
  const snap = readWebSnapshot();
  const tasks = snap.tasks.some((t) => t.id === task.id)
    ? snap.tasks.map((t) => (t.id === task.id ? task : t))
    : [...snap.tasks, task];
  writeWebSnapshot({ tasks });
}

export async function saveSettings(settings: Settings): Promise<void> {
  writeWebSnapshot({ settings });
}

export async function saveReview(review: ReviewState): Promise<void> {
  writeWebSnapshot({ review });
}

export async function upsertProject(project: Project): Promise<void> {
  const snap = readWebSnapshot();
  const projects = snap.projects.some((p) => p.id === project.id)
    ? snap.projects.map((p) => (p.id === project.id ? project : p))
    : [...snap.projects, project];
  writeWebSnapshot({ projects });
}

export async function upsertMeeting(meeting: Meeting): Promise<void> {
  const snap = readWebSnapshot();
  const meetings = snap.meetings.some((m) => m.id === meeting.id)
    ? snap.meetings.map((m) => (m.id === meeting.id ? meeting : m))
    : [...snap.meetings, meeting];
  writeWebSnapshot({ meetings });
}
