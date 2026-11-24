import test from 'node:test';
import assert from 'node:assert/strict';
import { createTask, transition } from './task';
import { DEFAULT_SETTINGS, type Settings } from './types';
import { isQuietHours, nextWeekendMorning, shiftOutOfQuiet } from './clock';
import { planReminders } from './reminders';
import { activeElapsedMs, completeWeeklyReview, pauseWeeklyReview, startWeeklyReview, weeklyTimeUp } from './reviewSession';
import { archiveProject, assertUniqueProjectName, createMeeting, createProject, inheritMeetingProject, projectProgress, softDeleteProject } from './project';
import { calendarEventDraft } from './calendarEvent';
import { assertCompleteExport, exportIsStale } from './exportHealth';
import { toCSV, toExportDocument } from './exportDoc';

const settings: Settings = { ...DEFAULT_SETTINGS, notificationsEnabled: true };

test('quiet hours wrap midnight and shift fires after they end', () => {
  assert.equal(isQuietHours(new Date('2026-11-25T22:00:00'), settings), true);
  assert.equal(isQuietHours(new Date('2026-11-25T07:00:00'), settings), true);
  assert.equal(isQuietHours(new Date('2026-11-25T10:00:00'), settings), false);
  const shifted = shiftOutOfQuiet(new Date('2026-11-25T22:30:00'), settings);
  assert.equal(shifted.getHours(), 8);
});

test('inbox gets three later nudges and scheduled tasks fire at their slot', () => {
  const now = new Date('2026-11-25T09:00:00');
  const inbox = createTask('Place me');
  const slot = transition(createTask('Visit office'), 'Schedule now', {
    start: '2026-11-25T15:00:00',
    duration: 30,
    energy: 'Medium',
  });
  const plan = planReminders([inbox, slot], settings, { sessions: 0, startedAt: null, pausedAt: null, elapsedMs: 0, sessionIds: null, decisions: [], lastSomedayAt: null }, [], now);
  assert.equal(plan.filter((item) => item.kind === 'inbox').length, 3);
  assert.ok(plan.some((item) => item.kind === 'slot' && item.taskId === slot.id));
  assert.ok(plan.some((item) => item.kind === 'evening'));
  assert.equal(planReminders([inbox], { ...settings, notificationsEnabled: false }, plan[0] ? { sessions: 0, startedAt: null, pausedAt: null, elapsedMs: 0, sessionIds: null, decisions: [], lastSomedayAt: null } : { sessions: 0, startedAt: null, pausedAt: null, elapsedMs: 0, sessionIds: null, decisions: [], lastSomedayAt: null }, [], now).length, 0);
});

test('weekly review pause uses active time not wall time and keeps the same items', () => {
  const tasks = Array.from({ length: 3 }, () => transition(createTask('Think'), 'Important'));
  const started = startWeeklyReview(tasks, { sessions: 3, startedAt: null, pausedAt: null, elapsedMs: 0, sessionIds: null, decisions: [], lastSomedayAt: null }, new Date('2026-11-25T10:00:00'));
  assert.equal(started.sessionIds?.length, 3);
  const paused = pauseWeeklyReview(started, new Date('2026-11-25T10:05:00'));
  assert.equal(paused.elapsedMs, 5 * 60 * 1000);
  assert.equal(activeElapsedMs(paused, new Date('2026-11-25T11:00:00')), 5 * 60 * 1000);
  const resumed = startWeeklyReview(tasks, paused, new Date('2026-11-25T11:00:00'));
  assert.equal(weeklyTimeUp({ ...resumed, elapsedMs: 16 * 60 * 1000, pausedAt: new Date().toISOString() }), true);
  assert.equal(completeWeeklyReview(resumed).sessions, 4);
  assert.equal(completeWeeklyReview(resumed).startedAt, null);
});

test('projects stay linked on archive and unlink open tasks on soft-delete', () => {
  const project = createProject('Website');
  assert.throws(() => assertUniqueProjectName('website', [project]));
  const task = { ...createTask('Draft'), projectId: project.id };
  const archived = archiveProject(project);
  assert.equal(archived.status, 'Archived');
  assert.equal(projectProgress(archived, [task]).total, 1);
  const removed = softDeleteProject(project, [task]);
  assert.equal(removed.project.deleted, true);
  assert.equal(removed.tasks[0].projectId, null);
  const meeting = createMeeting('Catch-up', '2026-11-25T14:00:00', { projectId: project.id });
  assert.equal(inheritMeetingProject(createTask('Prep'), meeting).projectId, project.id);
});

test('calendar draft uses start plus duration and export keeps unicode, formulas, and links', () => {
  const project = createProject('Café');
  const task = transition(createTask('=HACK'), 'Schedule now', {
    start: '2026-11-25T18:00:00',
    duration: 30,
    energy: 'Low',
    projectId: project.id,
  });
  const draft = calendarEventDraft(task);
  assert.equal(draft?.end.getTime(), draft!.start.getTime() + 30 * 60000);
  const csv = toCSV([task]);
  assert.match(csv, /"'=HACK"/);
  const doc = toExportDocument({
    tasks: [task],
    projects: [project],
    meetings: [],
    settings: settings,
    review: { sessions: 1, startedAt: null, pausedAt: null, elapsedMs: 0, sessionIds: null, decisions: [], lastSomedayAt: null },
  });
  assertCompleteExport(doc);
  assert.equal(exportIsStale(null), true);
  assert.equal(exportIsStale(new Date().toISOString()), false);
});

test('next weekend morning lands on the chosen review day', () => {
  const wednesday = new Date('2026-11-25T12:00:00');
  const friday = nextWeekendMorning(wednesday, { ...settings, weekend: 'Friday' });
  assert.equal(friday.getDay(), 5);
});
