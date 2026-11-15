export const categories = ['Inbox', 'Schedule now', 'Important', 'Someday', 'Done'];
export const localDay = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export function validateSchedule(task) {
  if (!task.start || !Number.isFinite(new Date(task.start).getTime())) return 'Choose a start date and time.';
  if (!Number.isFinite(Number(task.duration)) || Number(task.duration) <= 0) return 'Add a duration greater than zero.';
  if (!['High', 'Medium', 'Low'].includes(task.energy)) return 'Choose an energy level.';
  return '';
}
export function createTask(title, fields = {}) {
  if (!title.trim()) throw new Error('Give your task a title.');
  const now = new Date().toISOString();
  return { ...fields, id: crypto.randomUUID(), title: title.trim(), originalText: fields.originalText ?? title, source: fields.source ?? 'typed', priority: fields.priority || 'Normal', state: 'Inbox', createdAt: now, updatedAt: now, deleted: false, history: [], reschedules: [] };
}
export function transition(task, state, fields = {}) {
  if (!categories.includes(state)) throw new Error('Unknown category.');
  const next = { ...task, ...fields, state };
  if (!next.title.trim()) throw new Error('Give your task a title.');
  if (state === 'Schedule now') { const error = validateSchedule(next); if (error) throw new Error(error); }
  const now = new Date().toISOString();
  return { ...next, updatedAt: now, completedAt: state === 'Done' ? now : null,
    history: [...task.history, { from: task.state, to: state, time: now }],
    reschedules: task.state === 'Schedule now' && state !== 'Done' && (state !== 'Schedule now' || task.start !== next.start)
      ? [...task.reschedules, { oldSlot: task.start, newSlot: state === 'Schedule now' ? next.start : null, reason: fields.reason || 'Reprioritised', time: now }] : task.reschedules };
}
export const needsAttention = (task, now = Date.now()) => !task.deleted && task.state === 'Schedule now' && new Date(task.start).getTime() + Number(task.duration) * 60000 < now;
export function reviewTasks(tasks, sessions, sessionIds = null) {
  const sorted = tasks.filter(t => !t.deleted && t.state === 'Important').sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (sessionIds) return sorted.filter(t => sessionIds.includes(t.id));
  return sessions < 3 ? sorted : sorted.slice(0, 20);
}
export function toCSV(tasks) {
  const fields = ['id', 'title', 'state', 'priority', 'originalText', 'source', 'project', 'start', 'duration', 'energy'];
  const cell = value => {
    const text = String(value ?? '');
    const safe = /^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text) ? `'${text}` : text;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  return [fields.join(','), ...tasks.filter(t => !t.deleted).map(t => fields.map(f => cell(t[f])).join(','))].join('\r\n');
}
export function seedData() {
  const day = localDay();
  const task = (title, state, fields = {}) => ({ ...createTask(title, fields), state });
  return { tasks: [
    task('Put the finishing touches on the proposal', 'Schedule now', { start: `${day}T10:00`, duration: 45, energy: 'High', project: 'Website refresh', note: 'Keep the first version simple.' }),
    task('A little time for a walk', 'Schedule now', { start: `${day}T17:30`, duration: 30, energy: 'Low', project: 'A little more balance' }),
    task('Send the moodboard to Maya', 'Inbox', { originalText: 'Maya asked for the moodboard and a shortlist of typefaces.', source: 'shared', project: 'Website refresh' }),
    task('Book a weekend with the family', 'Inbox', { project: 'A little more balance' }),
    task('Explore ideas for the portfolio', 'Inbox'),
    task('Think through the launch plan', 'Important', { project: 'Website refresh' }),
    task('Make more room for reading', 'Important', { project: 'A little more balance' }),
    task('Learn a little pottery', 'Someday'),
    task('Gather inspiration', 'Done', { project: 'Website refresh' })
  ], projects: [
    { id: crypto.randomUUID(), name: 'Website refresh', context: 'Work', description: 'A fresh home for our next chapter.', status: 'Active' },
    { id: crypto.randomUUID(), name: 'A little more balance', context: 'Personal', description: 'Space for the things beyond work.', status: 'Active' }
  ], meetings: [{ id: crypto.randomUUID(), title: 'A creative catch-up', date: `${day}T14:00`, project: 'Website refresh', participants: 'Maya, you', notes: 'Bring the moodboard and talk about the direction.' }],
  settings: { weekend: 'Friday', workStart: '09:00', workEnd: '18:00', quietStart: '21:00', quietEnd: '08:00', onboarded: false }, review: { sessions: 0, decisions: [], startedAt: null } };
}
