export interface GrievanceStatusChangeEvent {
  id: string;
  refCode: string;
  caseId?: string;
  entityName: string;
  previousStatus?: string;
  newStatus: 'SUBMITTED' | 'TRIAGED' | 'UNDER_INVESTIGATION' | 'ENTITY_CURE_PERIOD' | 'REGULATORY_ESCALATION' | 'ACTION_TAKEN' | 'RESOLVED';
  title: string;
  message: string;
  officerName?: string;
  docketRef?: string;
  timestamp: string;
  urgency: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  read?: boolean;
}

const STORAGE_KEY_EVENTS = 'trustcheck_grievance_status_events';
const STORAGE_KEY_LATEST = 'trustcheck_latest_grievance_event';
const STORAGE_KEY_MY_REFS = 'trustcheck_monitored_grievance_refs';
const CHANNEL_NAME = 'trustcheck_grievance_broadcast_channel';
const CUSTOM_EVENT_NAME = 'trustcheck_grievance_status_change';

export class GrievanceNotificationService {
  /**
   * Registers a grievance reference code to be actively monitored by this client.
   */
  public static registerMonitoredRef(refCode: string): void {
    if (!refCode || typeof window === 'undefined') return;
    try {
      const stored = this.getMonitoredRefs();
      if (!stored.includes(refCode)) {
        stored.unshift(refCode);
        localStorage.setItem(STORAGE_KEY_MY_REFS, JSON.stringify(stored.slice(0, 20)));
      }
    } catch (e) {
      console.warn('[GrievanceNotificationService] Failed to register ref:', e);
    }
  }

  public static getMonitoredRefs(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_MY_REFS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Broadcasts a status change event across all browser tabs, windows, and local listeners.
   */
  public static broadcastStatusChange(
    eventData: Omit<GrievanceStatusChangeEvent, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
  ): GrievanceStatusChangeEvent {
    const fullEvent: GrievanceStatusChangeEvent = {
      id: eventData.id || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: eventData.timestamp || new Date().toISOString(),
      read: false,
      ...eventData,
    };

    // Save to local event history
    this.saveEvent(fullEvent);

    if (typeof window !== 'undefined') {
      // 1. In-memory window CustomEvent
      try {
        window.dispatchEvent(new CustomEvent(CUSTOM_EVENT_NAME, { detail: fullEvent }));
      } catch (e) {
        console.warn('CustomEvent dispatch error:', e);
      }

      // 2. Cross-tab BroadcastChannel
      try {
        if ('BroadcastChannel' in window) {
          const channel = new BroadcastChannel(CHANNEL_NAME);
          channel.postMessage(fullEvent);
          channel.close();
        }
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }

      // 3. Cross-tab Storage fallback event
      try {
        localStorage.setItem(STORAGE_KEY_LATEST, JSON.stringify({ ...fullEvent, _nonce: Date.now() }));
      } catch (e) {
        console.warn('Storage fallback error:', e);
      }
    }

    return fullEvent;
  }

  /**
   * Subscribes to real-time status change events across all channels.
   */
  public static subscribe(callback: (event: GrievanceStatusChangeEvent) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    // 1. CustomEvent listener
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<GrievanceStatusChangeEvent>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      }
    };
    window.addEventListener(CUSTOM_EVENT_NAME, handleCustomEvent);

    // 2. BroadcastChannel listener
    let channel: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        channel = new BroadcastChannel(CHANNEL_NAME);
        channel.onmessage = (e: MessageEvent<GrievanceStatusChangeEvent>) => {
          if (e.data) {
            callback(e.data);
          }
        };
      }
    } catch (err) {
      console.warn('BroadcastChannel initialization error:', err);
    }

    // 3. Storage event listener (for older browsers or multi-tab sync)
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_LATEST && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          callback(parsed);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    // Unsubscribe cleanup function
    return () => {
      window.removeEventListener(CUSTOM_EVENT_NAME, handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
      if (channel) {
        try {
          channel.close();
        } catch {}
      }
    };
  }

  /**
   * Returns stored status change events.
   */
  public static getStoredEvents(): GrievanceStatusChangeEvent[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static saveEvent(event: GrievanceStatusChangeEvent): void {
    if (typeof window === 'undefined') return;
    try {
      const existing = this.getStoredEvents();
      // Avoid duplicate event ids
      const filtered = existing.filter(e => e.id !== event.id);
      const updated = [event, ...filtered].slice(0, 30);
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save event:', e);
    }
  }

  public static markAsRead(eventId: string): void {
    if (typeof window === 'undefined') return;
    try {
      const existing = this.getStoredEvents();
      const updated = existing.map(e => e.id === eventId ? { ...e, read: true } : e);
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(updated));
    } catch {}
  }

  public static markAllAsRead(): void {
    if (typeof window === 'undefined') return;
    try {
      const existing = this.getStoredEvents();
      const updated = existing.map(e => ({ ...e, read: true }));
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(updated));
    } catch {}
  }

  /**
   * Helper to simulate a real-time status progression from the dashboard
   * (e.g. TRIAGED -> UNDER_INVESTIGATION -> REGULATORY_ESCALATION -> RESOLVED).
   */
  public static simulateDashboardStatusChange(
    targetRef?: string,
    stepIndex?: number
  ): GrievanceStatusChangeEvent {
    const defaultRef = targetRef || this.getMonitoredRefs()[0] || 'GRV-BD-2026-89102';

    const stages: Array<{
      status: GrievanceStatusChangeEvent['newStatus'];
      urgency: GrievanceStatusChangeEvent['urgency'];
      title: string;
      message: string;
      officer: string;
      docket?: string;
    }> = [
      {
        status: 'TRIAGED',
        urgency: 'INFO',
        title: 'Grievance Triaged & AI Verified',
        message: 'Your report was cross-checked with telecom incident graphs and verified with High credibility.',
        officer: 'Tanvir Hossain (Cyber Forensics Lead)',
      },
      {
        status: 'UNDER_INVESTIGATION',
        urgency: 'WARNING',
        title: 'Assigned to Regulatory Ombudsman',
        message: 'The BTRC / DNCRP Consumer Wing has assigned an officer to gather transaction evidence from the merchant.',
        officer: 'Fatima Rahman (Senior Ombudsman)',
        docket: `BTRC-DOC-${Math.floor(100000 + Math.random() * 900000)}`,
      },
      {
        status: 'REGULATORY_ESCALATION',
        urgency: 'CRITICAL',
        title: 'Statutory Escalation & Cure Notice Issued',
        message: 'A formal 48-hour Statutory Rectification Notice has been served to the suspect entity with sovereign timestamp.',
        officer: 'Marcus Sterling (Super Admin / Enforcement)',
        docket: `CURE-NOTICE-${Date.now().toString().slice(-6)}`,
      },
      {
        status: 'RESOLVED',
        urgency: 'SUCCESS',
        title: 'Grievance Successfully Resolved',
        message: 'Entity has ceased unauthorized transactions and consumer remediation protocol has been fulfilled.',
        officer: 'Fatima Rahman (Senior Ombudsman)',
        docket: `COMPLIANCE-RESOLVED-${Date.now().toString().slice(-6)}`,
      },
    ];

    const chosen = typeof stepIndex === 'number' && stepIndex >= 0 && stepIndex < stages.length
      ? stages[stepIndex]
      : stages[Math.floor(Math.random() * stages.length)];

    return this.broadcastStatusChange({
      refCode: defaultRef,
      entityName: 'PayQuick Merchant Services (BD-89102)',
      newStatus: chosen.status,
      title: chosen.title,
      message: chosen.message,
      officerName: chosen.officer,
      docketRef: chosen.docket,
      urgency: chosen.urgency,
    });
  }

  /**
   * Polls the backend API for live status changes.
   */
  public static async pollServerUpdates(refCode: string): Promise<GrievanceStatusChangeEvent | null> {
    try {
      const res = await fetch(`/api/v1/grievance/track/${encodeURIComponent(refCode)}`);
      if (!res.ok) return null;
      const json = await res.json();
      if (json.success && json.data) {
        const report = json.data;
        // Compare with latest known status
        const latest = this.getStoredEvents().find(e => e.refCode === refCode);
        if (!latest || latest.newStatus !== report.status) {
          return this.broadcastStatusChange({
            refCode: report.ref_code || refCode,
            entityName: report.entity_name || 'Regulated Entity',
            previousStatus: latest?.newStatus,
            newStatus: (report.status?.toUpperCase() || 'TRIAGED') as any,
            title: `Status Updated to ${report.status}`,
            message: `Latest regulatory status update received from the central sovereign registry.`,
            urgency: report.status === 'resolved' ? 'SUCCESS' : 'INFO',
          });
        }
      }
    } catch (e) {
      console.warn('[GrievanceNotificationService] Poll failed:', e);
    }
    return null;
  }
}
