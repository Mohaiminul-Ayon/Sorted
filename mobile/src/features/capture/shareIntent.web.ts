import type { ReactNode } from 'react';

const emptyIntent = {
  text: null as string | null,
  webUrl: null as string | null,
  files: null,
  type: null as 'text' | null,
  meta: null as Record<string, string | undefined> | null,
};

export function ShareIntentProvider({ children }: { children: ReactNode }) {
  return children;
}

export function useShareIntentContext() {
  return {
    hasShareIntent: false,
    shareIntent: emptyIntent,
    resetShareIntent: () => {},
    error: null as string | null,
  };
}
