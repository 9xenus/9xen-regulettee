import { useCallback, useRef, useState } from 'react';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

interface UseAutoSaveProps<T> {
  onSave: (data: T) => Promise<void>;
  debounceMs?: number;
}

export function useAutoSave<T>({ onSave, debounceMs = 1500 }: UseAutoSaveProps<T>) {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const timeoutRef = useRef<number | null>(null);

  const updateGlobalStatus = (newStatus: AutoSaveStatus) => {
    setStatus(newStatus);
    window.dispatchEvent(new CustomEvent('auto-save-status', { detail: newStatus }));
  };

  const triggerSave = useCallback(
    (data: T) => {
      // Clear previous timeout
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      updateGlobalStatus('saving');

      // Set new timeout for debouncing
      timeoutRef.current = window.setTimeout(async () => {
        try {
          // Check if offline
          if (!navigator.onLine) {
            updateGlobalStatus('offline');
            return;
          }

          await onSave(data);
          updateGlobalStatus('saved');
        } catch (err) {
          console.error('Auto-save failed:', err);
          updateGlobalStatus('error');
        }
      }, debounceMs);
    },
    [onSave, debounceMs]
  );

  return { status, triggerSave };
}
