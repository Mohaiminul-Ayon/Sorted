import { useEffect } from 'react';
import { useShareIntentContext } from './shareIntent';
import { shareTextFromIntent, sourceAppFromIntent } from '../../domain/capture';
import { useApp } from '../../shell/AppContext';

export function ShareCaptureListener() {
  const { openCapture } = useApp();
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();

  useEffect(() => {
    if (!hasShareIntent) return;
    const text = shareTextFromIntent(shareIntent);
    if (text) {
      openCapture({
        text,
        source: 'shared',
        sourceApp: sourceAppFromIntent(shareIntent),
      });
    }
    resetShareIntent();
  }, [hasShareIntent, openCapture, resetShareIntent, shareIntent]);

  return null;
}
