import { useCallback, useEffect, useRef, useState } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { pickSpeechLocale } from '../../domain/capture';

export function useVoiceCapture(onTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState('');
  const [locale, setLocale] = useState('en-US');
  const [supported, setSupported] = useState<string[]>([]);
  const cancelled = useRef(false);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  useSpeechRecognitionEvent('start', () => {
    setListening(true);
    setStatus('Listening…');
  });
  useSpeechRecognitionEvent('end', () => {
    setListening(false);
    if (!cancelled.current) setStatus('');
  });
  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript?.trim();
    if (text) onTranscriptRef.current(text);
  });
  useSpeechRecognitionEvent('error', (event) => {
    setListening(false);
    if (event.error === 'aborted' || cancelled.current) {
      setStatus('');
      return;
    }
    if (event.error === 'not-allowed') {
      setStatus('Microphone access is needed only while you speak.');
      return;
    }
    if (event.error === 'no-speech') {
      setStatus('Nothing was heard. Try again when you are ready.');
      return;
    }
    if (event.error === 'service-not-allowed' || event.error === 'language-not-supported') {
      setStatus('Voice capture is not available on this device.');
      return;
    }
    setStatus(event.message || 'Voice capture could not finish.');
  });

  useEffect(() => () => ExpoSpeechRecognitionModule.abort(), []);

  const resolveLocale = useCallback(async () => {
    try {
      const device = Intl.DateTimeFormat().resolvedOptions().locale;
      const { locales, installedLocales } = await ExpoSpeechRecognitionModule.getSupportedLocales({});
      setSupported([...new Set([...installedLocales, ...locales])]);
      const next = pickSpeechLocale(device, locales, installedLocales);
      setLocale(next);
      return next;
    } catch {
      return locale;
    }
  }, [locale]);

  const start = useCallback(async () => {
    cancelled.current = false;
    setStatus('');
    if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
      setStatus('Voice capture is not available on this device.');
      return;
    }
    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setStatus('Microphone access is needed only while you speak.');
      return;
    }
    const lang = await resolveLocale();
    ExpoSpeechRecognitionModule.start({
      lang,
      interimResults: true,
      continuous: false,
      addsPunctuation: true,
    });
  }, [resolveLocale]);

  const cancel = useCallback(() => {
    cancelled.current = true;
    ExpoSpeechRecognitionModule.abort();
    setListening(false);
    setStatus('');
  }, []);

  return { listening, status, locale, supported, start, cancel };
}
