import type { Meeting, Project, ProjectContext, Task } from './types';

export function createProject(name: string, fields: Partial<Project> = {}): Project {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Give this project a name.');
  const now = new Date().toISOString();
  return {
    id: fields.id ?? crypto.randomUUID(),
    name: trimmed,
    description: fields.description ?? null,
    targetDate: fields.targetDate ?? null,
    context: fields.context ?? 'Personal',
    status: fields.status ?? 'Active',
    createdAt: fields.createdAt ?? now,
    updatedAt: now,
    deleted: false,
  };
}

export function createMeeting(title: string, startsAt: string, fields: Partial<Meeting> = {}): Meeting {
  const trimmed = title.trim();
  if (!trimmed) throw new Error('Give this meeting a title.');
  if (!startsAt || !Number.isFinite(new Date(startsAt).getTime())) throw new Error('Choose a meeting time.');
  const now = new Date().toISOString();
  return {
    id: fields.id ?? crypto.randomUUID(),
    title: trimmed,
    startsAt,
    notes: fields.notes ?? null,
    participants: fields.participants ?? null,
    projectId: fields.projectId ?? null,
    createdAt: fields.createdAt ?? now,
    updatedAt: now,
    deleted: false,
  };
}

export function assertUniqueProjectName(name: string, projects: Project[], exceptId?: string): void {
  const needle = name.trim().toLowerCase();
  const clash = projects.find((project) => !project.deleted && project.id !== exceptId && project.name.trim().toLowerCase() === needle);
  if (clash) throw new Error('A project with this name already exists.');
}

export function archiveProject(project: Project): Project {
  return { ...project, status: 'Archived', updatedAt: new Date().toISOString() };
}

export function restoreProject(project: Project): Project {
  return { ...project, status: 'Active', deleted: false, updatedAt: new Date().toISOString() };
}

export function softDeleteProject(project: Project, tasks: Task[]): { project: Project; tasks: Task[] } {
  const now = new Date().toISOString();
  return {
    project: { ...project, deleted: true, status: 'Archived', updatedAt: now },
    tasks: tasks.map((task) => (task.projectId === project.id && !task.deleted && task.state !== 'Done' ? { ...task, projectId: null, updatedAt: now } : task)),
  };
}

export function projectProgress(project: Project, tasks: Task[]): { done: number; total: number } {
  const linked = tasks.filter((task) => !task.deleted && task.projectId === project.id);
  return { done: linked.filter((task) => task.state === 'Done').length, total: linked.length };
}

export function inheritMeetingProject(task: Task, meeting: Meeting | null): Task {
  if (!meeting?.projectId || task.projectId) return task;
  return { ...task, projectId: meeting.projectId };
}

export const CONTEXTS: ProjectContext[] = ['Work', 'Family', 'Personal'];
