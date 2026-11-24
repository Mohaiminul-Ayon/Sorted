import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { addNetworkStateListener, getNetworkStateAsync } from 'expo-network';
import type { CaptureSource, Meeting, Project, ReviewState, Settings, Task, TaskState } from '../domain/types';
import { DEFAULT_REVIEW, DEFAULT_SETTINGS } from '../domain/types';
import { createTask, transition } from '../domain/task';
import { inboxTitlesFromCapture, type CaptureDraft } from '../domain/capture';
import { snoozeUntil } from '../domain/reminders';
import { withCalendarEvent } from '../domain/calendarEvent';
import { loadSnapshot, saveReview, saveSettings, upsertMeeting, upsertProject, upsertTask } from '../data/store';
import { requestReminderPermission, syncDeviceReminders } from '../features/reminders/syncReminders';
import { upsertTaskCalendarEvent } from '../features/calendar/deviceCalendar';

type Snapshot = {
  tasks: Task[];
  projects: Project[];
  meetings: Meeting[];
  settings: Settings;
  review: ReviewState;
  schemaVersion: number;
  lastOpenedAt: string | null;
};

export type CaptureInput = CaptureDraft & { originalText?: string };

type AppContextValue = Snapshot & {
  ready: boolean;
  loadError: string;
  online: boolean;
  captureOpen: boolean;
  pendingCapture: CaptureDraft | null;
  editingTask: Task | null;
  openCapture: (draft?: CaptureDraft) => void;
  closeCapture: () => void;
  openTask: (task: Task) => void;
  closeTask: () => void;
  captureInbox: (title: string, fields?: { source?: CaptureSource; originalText?: string; sourceApp?: string | null }) => Promise<void>;
  captureDraft: (draft: CaptureInput) => Promise<number>;
  saveTask: (task: Task) => Promise<void>;
  placeTask: (task: Task, state: TaskState, fields?: Partial<Task> & { reason?: string }) => Promise<Task>;
  saveProject: (project: Project) => Promise<void>;
  saveMeeting: (meeting: Meeting) => Promise<void>;
  saveReviewState: (review: ReviewState) => Promise<void>;
  enableReminders: () => Promise<boolean>;
  skipInboxUntil: (when: string) => Promise<void>;
  addTaskToCalendar: (task: Task) => Promise<void>;
  markExported: () => Promise<void>;
  completeOnboarding: (patch: Pick<Settings, 'weekend' | 'workStart' | 'workEnd' | 'quietStart' | 'quietEnd'>) => Promise<void>;
  refresh: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [online, setOnline] = useState(true);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [pendingCapture, setPendingCapture] = useState<CaptureDraft | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot>({
    tasks: [],
    projects: [],
    meetings: [],
    settings: DEFAULT_SETTINGS,
    review: DEFAULT_REVIEW,
    schemaVersion: 0,
    lastOpenedAt: null,
  });

  const refresh = useCallback(async () => {
    try {
      const next = await loadSnapshot();
      setSnapshot(next);
      setLoadError('');
      setReady(true);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Your plan could not be opened.');
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  useEffect(() => {
    let mounted = true;
    void getNetworkStateAsync().then((state) => {
      if (mounted) setOnline(state.isConnected !== false);
    });
    const sub = addNetworkStateListener((state) => {
      setOnline(state.isConnected !== false);
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (!ready || !snapshot.settings.onboarded) return;
    void syncDeviceReminders({
      tasks: snapshot.tasks,
      settings: snapshot.settings,
      review: snapshot.review,
      projects: snapshot.projects,
    });
  }, [ready, snapshot.meetings, snapshot.projects, snapshot.review, snapshot.settings, snapshot.tasks]);

  const openCapture = useCallback((draft?: CaptureDraft) => {
    setPendingCapture(draft ?? { text: '', source: 'typed', sourceApp: null });
    setCaptureOpen(true);
  }, []);

  const closeCapture = useCallback(() => {
    setCaptureOpen(false);
    setPendingCapture(null);
  }, []);

  const captureInbox = useCallback(
    async (title: string, fields: { source?: CaptureSource; originalText?: string; sourceApp?: string | null } = {}) => {
      const task = createTask(title, {
        source: fields.source ?? 'typed',
        originalText: fields.originalText ?? title.trim(),
        sourceApp: fields.sourceApp ?? null,
      });
      await upsertTask(task);
      await refresh();
    },
    [refresh],
  );

  const captureDraft = useCallback(
    async (draft: CaptureInput) => {
      const titles = inboxTitlesFromCapture(draft.text);
      if (!titles.length) throw new Error('Give your task a title.');
      const originalText = (draft.originalText ?? draft.text).trim();
      for (const title of titles) {
        await upsertTask(
          createTask(title, {
            source: draft.source,
            originalText,
            sourceApp: draft.sourceApp,
          }),
        );
      }
      await refresh();
      return titles.length;
    },
    [refresh],
  );

  const saveTask = useCallback(
    async (task: Task) => {
      await upsertTask(task);
      setEditingTask(task);
      await refresh();
    },
    [refresh],
  );

  const placeTask = useCallback(
    async (task: Task, state: TaskState, fields: Partial<Task> & { reason?: string } = {}) => {
      const next = transition(task, state, fields);
      await upsertTask(next);
      setEditingTask(next);
      await refresh();
      return next;
    },
    [refresh],
  );

  const saveProject = useCallback(
    async (project: Project) => {
      await upsertProject(project);
      await refresh();
    },
    [refresh],
  );

  const saveMeeting = useCallback(
    async (meeting: Meeting) => {
      await upsertMeeting(meeting);
      await refresh();
    },
    [refresh],
  );

  const saveReviewState = useCallback(
    async (review: ReviewState) => {
      await saveReview(review);
      await refresh();
    },
    [refresh],
  );

  const enableReminders = useCallback(async () => {
    const granted = await requestReminderPermission();
    const settings: Settings = { ...snapshot.settings, notificationsEnabled: granted };
    await saveSettings(settings);
    await refresh();
    return granted;
  }, [refresh, snapshot.settings]);

  const skipInboxUntil = useCallback(
    async (when: string) => {
      await saveSettings({ ...snapshot.settings, inboxSkipUntil: when });
      await refresh();
    },
    [refresh, snapshot.settings],
  );

  const addTaskToCalendar = useCallback(
    async (task: Task) => {
      const eventId = await upsertTaskCalendarEvent(task);
      const next = withCalendarEvent(task, eventId);
      await upsertTask(next);
      setEditingTask(next);
      await refresh();
    },
    [refresh],
  );

  const markExported = useCallback(async () => {
    await saveSettings({ ...snapshot.settings, lastExportAt: new Date().toISOString() });
    await refresh();
  }, [refresh, snapshot.settings]);

  const completeOnboarding = useCallback(
    async (patch: Pick<Settings, 'weekend' | 'workStart' | 'workEnd' | 'quietStart' | 'quietEnd'>) => {
      const settings: Settings = { ...snapshot.settings, ...patch, onboarded: true };
      await saveSettings(settings);
      await saveReview(snapshot.review);
      await refresh();
    },
    [refresh, snapshot.review, snapshot.settings],
  );

  const value = useMemo(
    () => ({
      ...snapshot,
      ready,
      loadError,
      online,
      captureOpen,
      pendingCapture,
      editingTask,
      openCapture,
      closeCapture,
      openTask: setEditingTask,
      closeTask: () => setEditingTask(null),
      captureInbox,
      captureDraft,
      saveTask,
      placeTask,
      saveProject,
      saveMeeting,
      saveReviewState,
      enableReminders,
      skipInboxUntil,
      addTaskToCalendar,
      markExported,
      completeOnboarding,
      refresh,
    }),
    [
      snapshot,
      ready,
      loadError,
      online,
      captureOpen,
      pendingCapture,
      editingTask,
      openCapture,
      closeCapture,
      captureInbox,
      captureDraft,
      saveTask,
      placeTask,
      saveProject,
      saveMeeting,
      saveReviewState,
      enableReminders,
      skipInboxUntil,
      addTaskToCalendar,
      markExported,
      completeOnboarding,
      refresh,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

export function snoozeTaskStart(task: Task, from = new Date()): Partial<Task> & { reason: string } {
  if (task.state !== 'Schedule now' || !task.start) return { reason: 'Snoozed from reminder' };
  return { start: snoozeUntil(from, 15).toISOString(), reason: 'Snoozed from reminder' };
}
