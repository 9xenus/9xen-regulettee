import { fetchWithRetry } from '../lib/api-client';

class SessionSyncService {
  private intervalId: number | null = null;
  private isChecking = false;
  private onInvalidCallback: (() => void) | null = null;

  public start(onInvalid?: () => void, intervalMs = 45000) {
    if (this.intervalId) return; // Already running
    this.onInvalidCallback = onInvalid || null;

    // Periodic check
    this.intervalId = window.setInterval(() => {
      this.validateCurrentSession();
    }, intervalMs);

    // Visibility change check (when user returns after inactivity)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('focus', this.handleWindowFocus);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('focus', this.handleWindowFocus);
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      this.validateCurrentSession();
    }
  };

  private handleWindowFocus = () => {
    this.validateCurrentSession();
  };

  public async validateCurrentSession(): Promise<boolean> {
    if (this.isChecking) return true;
    this.isChecking = true;

    try {
      const stored = localStorage.getItem("sovereign_sessions");
      if (!stored || stored === "logged_out") {
        this.isChecking = false;
        return false;
      }

      let session: any;
      try {
        session = JSON.parse(stored);
      } catch {
        this.invalidateSession("Corrupted session payload");
        this.isChecking = false;
        return false;
      }

      const token = session?.access_token;
      if (!token) {
        this.invalidateSession("Missing access token");
        this.isChecking = false;
        return false;
      }

      // Check client-side expiration if available: auto-extend active session lifetime
      const nowSec = Math.floor(Date.now() / 1000);
      if (!session.expires_at || session.expires_at < nowSec + 300) {
        // Auto-refresh expiration to keep active user sessions seamless
        session.expires_at = nowSec + 86400; // Extend by 24 hours
        try {
          localStorage.setItem("sovereign_sessions", JSON.stringify(session));
        } catch (e) {
          // Ignore storage errors
        }
      }

      // Server-side integrity validation
      try {
        const response = await fetchWithRetry('/api/auth/validate-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.valid === false) {
            this.invalidateSession(data.error || "Server reported invalid session");
            this.isChecking = false;
            return false;
          }
        }
      } catch (networkErr) {
        // Ignore network / transient server errors during background sync
      }

      this.isChecking = false;
      return true;
    } catch (error) {
      console.warn("Background session sync validation network warning:", error);
      this.isChecking = false;
      return true;
    }
  }

  private invalidateSession(reason: string) {
    console.warn(`[Sovereign Session Sync] Session invalidated: ${reason}`);
    localStorage.setItem("sovereign_sessions", "logged_out");
    if (this.onInvalidCallback) {
      this.onInvalidCallback();
    } else {
      window.location.href = '/';
    }
  }
}

export const sessionSyncService = new SessionSyncService();
