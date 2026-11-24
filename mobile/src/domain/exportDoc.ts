import type { ExportDocument, Meeting, Project, ReviewState, Settings, Task } from './types';
import { SCHEMA_VERSION } from './types';

export function toCSV(tasks: Task[]): string {
  const fields = ['id', 'title', 'state', 'priority', 'originalText', 'source', 'projectId', 'start', 'duration', 'energy'] as const;
  const cell = (value: unknown) => {
    const text = String(value ?? '');
    const safe = /^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text) ? `'${text}` : text;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  return [
    fields.join(','),
    ...tasks.filter((t) => !t.deleted).map((t) => fields.map((f) => cell(t[f])).join(',')),
  ].join('\r\n');
}

export function toExportDocument(input: {
  tasks: Task[];
  projects: Project[];
  meetings: Meeting[];
  settings: Settings;
  review: ReviewState;
  exportedAt?: string;
}): ExportDocument {
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: input.exportedAt ?? new Date().toISOString(),
    tasks: input.tasks,
    projects: input.projects,
    meetings: input.meetings,
    settings: input.settings,
    review: input.review,
  };
}

export function assertExportDocument(doc: ExportDocument): void {
  if (doc.schemaVersion !== SCHEMA_VERSION) throw new Error('Unsupported export schema.');
  if (!Array.isArray(doc.tasks) || !Array.isArray(doc.projects) || !Array.isArray(doc.meetings)) {
    throw new Error('Export is missing entities.');
  }
  if (!doc.settings || typeof doc.settings.onboarded !== 'boolean') throw new Error('Export is missing settings.');
}
