export const TASK_STATES = ['Inbox', 'Schedule now', 'Important', 'Someday', 'Done'] as const;
export type TaskState = (typeof TASK_STATES)[number];

export const ENERGIES = ['High', 'Medium', 'Low'] as const;
export type Energy = (typeof ENERGIES)[number];

export const PROJECT_CONTEXTS = ['Work', 'Family', 'Personal'] as const;
export type ProjectContext = (typeof PROJECT_CONTEXTS)[number];

export const CAPTURE_SOURCES = ['typed', 'voice', 'shared', 'notification'] as const;
export type CaptureSource = (typeof CAPTURE_SOURCES)[number];

export type HistoryEntry = { from: TaskState; to: TaskState; time: string };
export type RescheduleEntry = {
  oldSlot: string | null;
  newSlot: string | null;
  reason: string;
  time: string;
};

export type Task = {
  id: string;
  title: string;
  state: TaskState;
  originalText: string;
  source: CaptureSource;
  sourceApp: string | null;
  priority: string;
  projectId: string | null;
  meetingId: string | null;
  start: string | null;
  duration: number | null;
  energy: Energy | null;
  prerequisiteNote: string | null;
  calendarEventId: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  history: HistoryEntry[];
  reschedules: RescheduleEntry[];
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  targetDate: string | null;
  context: ProjectContext;
  status: 'Active' | 'Archived';
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};

export type Meeting = {
  id: string;
  title: string;
  startsAt: string;
  notes: string | null;
  participants: string | null;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};

export type Settings = {
  weekend: 'Friday' | 'Saturday' | 'Sunday';
  workStart: string;
  workEnd: string;
  quietStart: string;
  quietEnd: string;
  notificationListenerEnabled: boolean;
  retainAiContext: boolean;
  onboarded: boolean;
};

export type ReviewState = { sessions: number; startedAt: string | null };

export type ExportDocument = {
  schemaVersion: 1;
  exportedAt: string;
  tasks: Task[];
  projects: Project[];
  meetings: Meeting[];
  settings: Settings;
  review: ReviewState;
};

export const DEFAULT_SETTINGS: Settings = {
  weekend: 'Friday',
  workStart: '09:00',
  workEnd: '18:00',
  quietStart: '21:00',
  quietEnd: '08:00',
  notificationListenerEnabled: false,
  retainAiContext: true,
  onboarded: false,
};

export const SCHEMA_VERSION = 1 as const;
