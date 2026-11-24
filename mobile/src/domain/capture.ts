import type { CaptureSource } from './types';

export type CaptureDraft = {
  text: string;
  source: CaptureSource;
  sourceApp: string | null;
};

export function inboxTitlesFromCapture(text: string): string[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines;
}

export function pickSpeechLocale(deviceLocale: string | undefined, locales: string[], installed: string[]): string {
  const preferred = (deviceLocale || 'en-US').replace(/_/g, '-');
  const haystack = [...installed, ...locales];
  const exact = haystack.find((locale) => locale.toLowerCase() === preferred.toLowerCase());
  if (exact) return exact;
  const prefix = preferred.split('-')[0]?.toLowerCase() ?? 'en';
  const byLanguage = haystack.find((locale) => {
    const lower = locale.toLowerCase();
    return lower === prefix || lower.startsWith(`${prefix}-`);
  });
  if (byLanguage) return byLanguage;
  return haystack.find((locale) => locale.toLowerCase().startsWith('en')) ?? 'en-US';
}

export function shareTextFromIntent(intent: {
  text?: string | null;
  webUrl?: string | null;
  meta?: { title?: string } | null;
}): string {
  return [intent.text, intent.webUrl].map((part) => part?.trim()).filter(Boolean).join('\n').trim();
}

export function sourceAppFromIntent(intent: { meta?: Record<string, string | undefined> | null }): string | null {
  const meta = intent.meta ?? {};
  return meta.packageName || meta.applicationName || meta.appName || meta.source || null;
}

export function describeCaptureSource(source: CaptureSource, sourceApp: string | null): string {
  if (source === 'shared' && sourceApp) return `shared · ${sourceApp}`;
  return source;
}
