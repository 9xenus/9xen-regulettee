import { useState, useEffect, useCallback } from 'react';

export const AI_AUTO_CATEGORIZATION_STORAGE_KEY = 'ai_auto_categorization_enabled';
export const AI_AUTO_CATEGORIZATION_EVENT = 'ai-auto-categorization-changed';

/**
 * Custom hook to read, toggle, and synchronize the AI-powered auto-categorization engine preference.
 * Defaults to `true` unless explicitly set to `false` in localStorage.
 */
export function useAiAutoCategorization() {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(AI_AUTO_CATEGORIZATION_STORAGE_KEY);
      if (stored === null) return true;
      return stored === 'true' || stored === '1';
    } catch {
      return true;
    }
  });

  // Sync state when changed elsewhere in the app or other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === AI_AUTO_CATEGORIZATION_STORAGE_KEY) {
        setIsEnabled(e.newValue === null ? true : e.newValue === 'true' || e.newValue === '1');
      }
    };

    const handleCustomEvent = (e: CustomEvent<{ enabled: boolean }>) => {
      if (e.detail && typeof e.detail.enabled === 'boolean') {
        setIsEnabled(e.detail.enabled);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(AI_AUTO_CATEGORIZATION_EVENT as any, handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(AI_AUTO_CATEGORIZATION_EVENT as any, handleCustomEvent);
    };
  }, []);

  const setAutoCategorization = useCallback((enabled: boolean) => {
    try {
      localStorage.setItem(AI_AUTO_CATEGORIZATION_STORAGE_KEY, enabled ? 'true' : 'false');
      // Also write alias for compatibility
      localStorage.setItem('ai_categorization_enabled', enabled ? 'true' : 'false');
      setIsEnabled(enabled);

      // Dispatch custom event for same-tab instant reactivity
      window.dispatchEvent(
        new CustomEvent(AI_AUTO_CATEGORIZATION_EVENT, {
          detail: { enabled }
        })
      );
    } catch (err) {
      console.error('Failed to save AI auto-categorization preference to localStorage:', err);
    }
  }, []);

  const toggleAutoCategorization = useCallback(() => {
    setAutoCategorization(!isEnabled);
  }, [isEnabled, setAutoCategorization]);

  return {
    isEnabled,
    setAutoCategorization,
    toggleAutoCategorization
  };
}
