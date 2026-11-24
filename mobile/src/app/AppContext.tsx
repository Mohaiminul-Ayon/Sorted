import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { addNetworkStateListener, getNetworkStateAsync } from 'expo-network';
import type { Meeting, Project, ReviewState, Settings, Task } from '../domain/types';
import { DEFAULT_SETTINGS } from '../domain/types';
import { createTask } from '../domain/task';
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

type AppContextValue = Snapshot & {
  ready: boolean;
  loadError: string;
  online: boolean;
  captureInbox: (title: string) => Promise<void>;
  completeOnboarding: (patch: Pick<Settings, 'weekend' | 'workStart' | 'workEnd'>) => Promise<void>;
  refresh: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [online, setOnline] = useState(true);
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

  const captureInbox = useCallback(async (title: string) => {
    const task = createTask(title, { source: 'typed' });
    await upsertTask(task);
    await refresh();
  }, [refresh]);

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
    () => ({ ...snapshot, ready, loadError, online, captureInbox, completeOnboarding, refresh }),
    [snapshot, ready, loadError, online, captureInbox, completeOnboarding, refresh],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
