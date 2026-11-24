import type { ExportDocument } from './types';

export function exportIsStale(lastExportAt: string | null, now = new Date(), days = 7): boolean {
  if (!lastExportAt) return true;
  return now.getTime() - new Date(lastExportAt).getTime() >= days * 24 * 60 * 60 * 1000;
}

export function assertCompleteExport(doc: ExportDocument): void {
  if (doc.schemaVersion !== 1) throw new Error('Unsupported export schema.');
  for (const task of doc.tasks) {
    if (!task.id || !task.title || !Array.isArray(task.history) || !Array.isArray(task.reschedules)) {
      throw new Error('Export is missing task history.');
    }
  }
  const projectIds = new Set(doc.projects.map((project) => project.id));
  const meetingIds = new Set(doc.meetings.map((meeting) => meeting.id));
  for (const task of doc.tasks) {
    if (task.projectId && !projectIds.has(task.projectId)) throw new Error('Export is missing a linked project.');
    if (task.meetingId && !meetingIds.has(task.meetingId)) throw new Error('Export is missing a linked meeting.');
  }
  if (!doc.settings || typeof doc.settings.onboarded !== 'boolean') throw new Error('Export is missing settings.');
  if (!doc.review || typeof doc.review.sessions !== 'number') throw new Error('Export is missing review state.');
}
