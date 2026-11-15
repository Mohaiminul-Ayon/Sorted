import { createTask, transition, localDay } from './model.js';
import { validateProposals } from './ai-contract.js';

const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const clockPattern = /\b(\d{1,2})(?::([0-5]\d))?\s*(am|pm)\b|\b([01]?\d|2[0-3]):([0-5]\d)\b|\b(noon|midnight)\b/gi;
const datePattern = /\b(today|tomorrow|(?:next\s+)?(?:sunday|monday|tuesday|wednesday|thursday|friday|saturday))\b/i;
const vagueDate = /\b(next week|next month|this weekend|tonight|this evening|this afternoon|this morning)\b|\b\d{1,4}[-/]\d{1,2}[-/]\d{1,4}\b|\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d/i;
const urgentPattern = /\b(urgent|asap|immediately|critical|must|deadline|due|important)\b/i;
const somedayPattern = /\b(someday|one day|eventually|no rush|maybe|might|would like|when i have time)\b/i;
const actionPattern = /\b(meeting|meet|visit|go|send|call|finish|prepare|submit|pay|book|buy|read|learn|write|review|complete|pick|collect|attend|come|need|want|remind|plan|explore|check|fix|renew|email|reply|deliver|draft|update)\b/i;
const stamp = date => `${localDay(date)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

function normalize(text) {
  return text.replace(/\b([ap])\.?m\.?\b/gi, '$1m').replace(/\b(mr|mrs|ms|dr)\./gi, '$1');
}

function splitActions(text) {
  return normalize(text)
    .split(/(?:[\n;]+|[.!?](?:\s+|$)|\s+(?:and(?:\s+then)?|then)\s+(?=(?:today|tomorrow|next|sunday|monday|tuesday|wednesday|thursday|friday|saturday|we|i|you|mr|mrs|ms|send|call|finish|prepare|submit|pay|book|buy|read|learn|write|review|complete|pick|collect|attend|meet|go|visit|check|fix|renew|email|reply|deliver|draft|update)\b)|,\s*(?=(?:today|tomorrow|next|sunday|monday|tuesday|wednesday|thursday|friday|saturday|send|call|finish|prepare|submit|pay|book|buy|read|learn|write|review|complete|pick|collect|attend|meet|go|visit|check|fix|renew|email|reply|deliver|draft|update)\b))/i)
    .map(part => part.trim()).filter(Boolean);
}

function readClock(text) {
  const matches = [...text.matchAll(clockPattern)];
  if (!matches.length) return null;
  if (matches.length > 1) return { problem: 'More than one time is mentioned. Choose the intended start time.' };
  const m = matches[0];
  if (m[6]) return { hour: m[6].toLowerCase() === 'noon' ? 12 : 0, minute: 0 };
  if (m[4] !== undefined) return { hour: Number(m[4]), minute: Number(m[5]) };
  const hour = Number(m[1]);
  if (hour < 1 || hour > 12) return { problem: 'That clock time needs checking.' };
  if (hour === 12 && m[3].toLowerCase() === 'am') return { hour: 0, minute: Number(m[2] || 0), problem: '12 AM means midnight. Confirm midnight or change it to noon.' };
  return { hour: hour % 12 + (m[3].toLowerCase() === 'pm' ? 12 : 0), minute: Number(m[2] || 0) };
}

function readDate(text, now, inheritedDay) {
  const matches = [...text.matchAll(new RegExp(datePattern.source, 'gi'))];
  if (matches.length > 1) return { problem: 'Multiple days are mentioned. Choose one date for this action.' };
  const found = matches[0];
  const day = new Date(inheritedDay || now);
  day.setHours(0, 0, 0, 0);
  if (vagueDate.test(text)) return { problem: 'This date phrase needs an exact date. Choose it once below.' };
  if (!found) return { day, assumed: true };
  day.setTime(now.getTime());
  day.setHours(0, 0, 0, 0);
  const value = found[0].toLowerCase();
  if (value === 'tomorrow') day.setDate(day.getDate() + 1);
  else if (value !== 'today') {
    let delta = (weekdays.indexOf(value.replace('next ', '')) - day.getDay() + 7) % 7;
    if (value.startsWith('next ') && !delta) delta = 7;
    day.setDate(day.getDate() + delta);
  }
  return { day, explicit: true, assumed: !['today', 'tomorrow'].includes(value) };
}

function overlaps(start, duration, existing) {
  const end = start.getTime() + duration * 60000;
  return existing.some(t => {
    if (t.deleted || t.state !== 'Schedule now') return false;
    const other = new Date(t.start).getTime();
    return start.getTime() < other + Number(t.duration) * 60000 && end > other;
  });
}

function freeSlot(day, duration, existing, settings, now) {
  const begin = (settings.workStart || '09:00').split(':').map(Number);
  const finish = (settings.workEnd || '18:00').split(':').map(Number);
  const start = new Date(day), end = new Date(day);
  start.setHours(begin[0], begin[1], 0, 0); end.setHours(finish[0], finish[1], 0, 0);
  if (start < now) start.setTime(Math.ceil(now.getTime() / 900000) * 900000);
  const quietStart = (settings.quietStart || '21:00').split(':').map(Number);
  const quietEnd = (settings.quietEnd || '08:00').split(':').map(Number);
  const qs = quietStart[0] * 60 + quietStart[1], qe = quietEnd[0] * 60 + quietEnd[1];
  for (; start.getTime() + duration * 60000 <= end.getTime(); start.setMinutes(start.getMinutes() + 15)) {
    let quiet = false;
    for (let minute = 0; minute < duration; minute++) {
      const m = (start.getHours() * 60 + start.getMinutes() + minute) % 1440;
      if (qs !== qe && (qs < qe ? m >= qs && m < qe : m >= qs || m < qe)) { quiet = true; break; }
    }
    if (!quiet && !overlaps(start, duration, existing)) return new Date(start);
  }
  return null;
}

function titleFor(text) {
  let title = text.replace(/^\s*(?:sir|hello|hi)[,\s]+/i, '').replace(datePattern, '').replace(clockPattern, '')
    .replace(/\b(?:at|on)\s*$/i, '').replace(/\bfor\s+\d+\s*(?:minutes?|mins?|hours?|hrs?)\b/gi, '')
    .replace(/^\s*(?:(?:we|i)\s+(?:have\s+(?:a\s+)?|need\s+to\s+|must\s+|will\s+)|remind me to\s+)/i, '')
    .replace(/\s+/g, ' ').replace(/^[\s,]+|[\s,.]+$/g, '');
  if (!title) title = text;
  return title.charAt(0).toUpperCase() + title.slice(1);
}

// shortcut: common English phrases only, replace with a validated language-model extractor for unrestricted messages.
export function organizeMessage(message, { tasks = [], meetings = [], settings = {}, now = new Date(), fields = {} } = {}) {
  if (!message.trim()) return [];
  const parts = splitActions(message);
  const calendar = meetings.map(m => ({ state: 'Schedule now', start: m.date, duration: 30 }));
  const prepared = parts.map(part => {
    const clock = readClock(part);
    const length = part.match(/\bfor\s+(\d+)\s*(minutes?|mins?|hours?|hrs?)\b/i);
    const duration = length ? Number(length[1]) * (/^(hour|hr)/i.test(length[2]) ? 60 : 1) : 30;
    const priority = urgentPattern.test(part) ? 'High' : /\b(meet|meeting|office|visit|appointment|come)\b/i.test(part) ? 'Medium' : 'Normal';
    const energy = /\b(write|draft|prepare|finish|review|plan)\b/i.test(part) ? 'High' : /\b(walk|buy|collect|pick)\b/i.test(part) ? 'Low' : 'Medium';
    return { part, clock, duration, priority, energy, task: createTask(titleFor(part), { ...fields, originalText: message, autoOrganized: true, priority, energy, duration }) };
  });
  let inheritedDay;
  // Reserve all explicitly timed commitments before placing flexible tasks.
  for (const item of prepared) {
    const date = readDate(item.part, now, inheritedDay);
    item.date = date;
    if (date.explicit) inheritedDay = date.day;
    item.problem = date.problem || item.clock?.problem;
    if (!actionPattern.test(item.part)) item.problem ||= 'I could not confidently identify an action. Check this thought.';
    if (item.duration <= 0 || item.duration > 1440) item.problem ||= 'Choose a duration between 1 and 1440 minutes.';
    if (/\b(by|before|until|due)\b/i.test(item.part) && item.clock) item.problem ||= 'This may be a deadline rather than a start time. Check the schedule.';
    if (/\b(at\s+\d{1,2}(?!\d)|\d{1,2}:\d{2})\b/i.test(item.part) && !item.clock) item.problem ||= 'Specify a valid time with AM/PM or a 24-hour clock.';
    if (item.clock?.hour !== undefined && date.day) {
      const start = new Date(date.day); start.setHours(item.clock.hour, item.clock.minute, 0, 0);
      item.start = start;
      if (start < now) item.problem ||= 'This time has already passed. Choose the intended date or time.';
      if (overlaps(start, item.duration, [...tasks, ...calendar])) item.problem ||= 'This overlaps an existing plan. Choose a time or keep both intentionally.';
      if (!item.problem) calendar.push({ state: 'Schedule now', start: stamp(start), duration: item.duration });
    }
  }
  return prepared.map(item => {
    let { task, clock, date, start, problem, part, duration, energy } = item;
    if (problem) return { ...task, needsClarification: true, suggestedStart: start ? stamp(start) : '', autoExplanation: problem };
    if (clock && start) {
      return transition(task, 'Schedule now', { start: stamp(start), autoExplanation: `Found a stated time. ${date.assumed ? 'Used the next occurrence of the day, or the previous day mentioned (today if none). ' : ''}${duration} minutes${/\bfor\s+\d+/i.test(part) ? ' from your message' : ' estimated'}; ${energy} focus estimated. You can change both.` });
    }
    if (somedayPattern.test(part) && !date.explicit && !urgentPattern.test(part)) return transition(task, 'Someday', { autoExplanation: 'This reads as a future possibility without a near-term commitment.' });
    if (date.explicit || urgentPattern.test(part)) {
      start = freeSlot(date.day, duration, [...tasks, ...calendar], settings, now);
      if (start) {
        calendar.push({ state: 'Schedule now', start: stamp(start), duration });
        return transition(task, 'Schedule now', { start: stamp(start), autoExplanation: `Found ${date.explicit ? 'a day' : 'an urgency cue'} without a start time. Chose a free slot within working hours, outside quiet hours. ${duration} minutes and ${energy} focus are estimates.` });
      }
      return { ...transition(task, 'Important'), autoExplanation: 'This needs attention, but there is no free slot in the selected day’s working hours.', needsClarification: true };
    }
    return transition(task, 'Important', { autoExplanation: 'An actionable thought without a clear date. Kept in Important rather than inventing a deadline.' });
  });
}

export function aiProposalsToTasks(value, message, { tasks = [], meetings = [], settings = {}, now = new Date(), fields = {}, keepContext = true } = {}) {
  const actions = validateProposals(value);
  const calendar = [...tasks, ...meetings.map(m => ({ state: 'Schedule now', start: m.date, duration: 30 }))];
  const drafts = actions.map(action => ({ action, task: createTask(action.title, { ...fields, originalText: keepContext ? message : '', contextSaved: keepContext, autoOrganized: true, planner: 'ai', priority: action.priority, duration: action.duration, energy: action.energy, autoExplanation: action.explanation }) }));
  for (const entry of drafts.filter(d => d.action.fixedTime)) {
    const { action } = entry;
    const start = new Date(action.start);
    entry.problem = action.clarification || (stamp(start) !== action.start ? 'This date or time is not valid locally.' : start < now ? 'This time has already passed.' : overlaps(start, action.duration, calendar) ? 'This conflicts with another plan. Choose a time or intentionally keep both.' : '');
    if (!entry.problem && action.state === 'Schedule now') calendar.push({ state: 'Schedule now', start: action.start, duration: action.duration });
  }
  return drafts.map(({ action, task, problem }) => {
    problem ||= action.clarification;
    if (problem) return { ...task, needsClarification: true, suggestedStart: action.start, autoExplanation: problem };
    if (action.state !== 'Schedule now') return transition(task, action.state);
    if (!action.start || stamp(new Date(action.start)) !== action.start) return { ...task, needsClarification: true, autoExplanation: 'Check the date and time before scheduling.' };
    const start = action.fixedTime ? new Date(action.start) : freeSlot(new Date(action.start), action.duration, calendar, settings, now);
    if (!start) return { ...transition(task, 'Important'), needsClarification: true, autoExplanation: 'There is no free working-time slot on that day. Choose another day.' };
    if (!action.fixedTime) calendar.push({ state: 'Schedule now', start: stamp(start), duration: action.duration });
    return transition(task, 'Schedule now', { start: stamp(start), autoExplanation: `${action.explanation}${action.fixedTime ? '' : ' Placed in a free working-time slot outside quiet hours.'}` });
  });
}
