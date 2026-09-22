type Listener = (...args: any[]) => void;

class CustomEventEmitter {
  private listeners: Record<string, Listener[]> = {};

  public on(event: string, listener: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
    return this;
  }

  public off(event: string, listener: Listener) {
    if (!this.listeners[event]) return this;
    this.listeners[event] = this.listeners[event].filter(l => l !== listener);
    return this;
  }

  public emit(event: string, ...args: any[]) {
    if (!this.listeners[event]) return false;
    this.listeners[event].forEach(l => {
      try {
        l(...args);
      } catch (e) {
        console.error(`Error in event listener for ${event}:`, e);
      }
    });
    return true;
  }

  public addListener(event: string, listener: Listener) {
    return this.on(event, listener);
  }

  public removeListener(event: string, listener: Listener) {
    return this.off(event, listener);
  }
}

export interface ResidencyAlert {
  id: string;
  region: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING';
  type: 'RESIDENCY_MISMATCH' | 'SOVEREIGNTY_BREACH' | 'SHARD_OFFLINE';
  message: string;
  timestamp: string;
  details?: any;
}

class SovereigntyAlertService extends CustomEventEmitter {
  private alerts: ResidencyAlert[] = [];
  private maxAlerts = 50;

  constructor() {
    super();
  }

  public pushAlert(alert: Omit<ResidencyAlert, 'id' | 'timestamp'>) {
    const newAlert: ResidencyAlert = {
      ...alert,
      id: `ALT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString()
    };

    this.alerts.unshift(newAlert);
    if (this.alerts.length > this.maxAlerts) {
      this.alerts.pop();
    }

    console.log(`[SOVEREIGNTY_ALERT] ${newAlert.type} in ${newAlert.region}: ${newAlert.message}`);
    this.emit('new_alert', newAlert);
  }

  public getAlerts(): ResidencyAlert[] {
    return this.alerts;
  }

  public clearAlerts() {
    this.alerts = [];
    this.emit('alerts_cleared');
  }
}

export const sovereigntyAlerts = new SovereigntyAlertService();
