import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { addNetworkStateListener, getNetworkStateAsync } from 'expo-network';
import type { CaptureSource, Meeting, Project, ReviewState, Settings, Task } from '../domain/types';
import { DEFAULT_SETTINGS } from '../domain/types';
import { createTask } from '../domain/task';
import { inboxTitlesFromCapture, type CaptureDraft } from '../domain/capture';
import { loadSnapshot, saveReview, saveSettings, upsertTask } from '../data/store';

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
  openCapture: (draft?: CaptureDraft) => void;
  closeCapture: () => void;
  captureInbox: (title: string, fields?: { source?: CaptureSource; originalText?: string; sourceApp?: string | null }) => Promise<void>;
  captureDraft: (draft: CaptureInput) => Promise<number>;
  completeOnboarding: (patch: Pick<Settings, 'weekend' | 'workStart' | 'workEnd'>) => Promise<void>;
  refresh: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [online, setOnline] = useState(true);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [pendingCapture, setPendingCapture] = useState<CaptureDraft | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot>({
    tasks: [],
    projects: [],
    meetings: [],
    settings: DEFAULT_SETTINGS,
    review: { sessions: 0, startedAt: null },
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

  const completeOnboarding = useCallback(
    async (patch: Pick<Settings, 'weekend' | 'workStart' | 'workEnd'>) => {
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
      openCapture,
      closeCapture,
      captureInbox,
      captureDraft,
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
      openCapture,
      closeCapture,
      captureInbox,
      captureDraft,
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
