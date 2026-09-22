import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNotification, ToastType } from '../context/NotificationContext';

export interface ComplianceAlertData {
  id?: string;
  title?: string;
  message: string;
  severity?: 'critical' | 'warning' | 'info' | 'CRITICAL' | 'WARNING' | 'INFO';
  category?: string;
  jurisdiction?: string;
  timestamp?: string;
}

export interface SystemStatusData {
  status: string;
  activeRegion: string;
  timestamp: string;
  securityLevel: string;
  latencyMs: number;
  complianceScore?: number;
  activeScans?: number;
}

export function useSocketIoClient() {
  const { showToast, addRegulatoryUpdate } = useNotification();
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [latestStatus, setLatestStatus] = useState<SystemStatusData | null>(null);
  const [lastAlert, setLastAlert] = useState<ComplianceAlertData | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(12);
  const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize Socket.io connection with exponential backoff configuration
    const socket: Socket = io({
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,       // Keep attempting without forcing page reload
      reconnectionDelay: 1000,          // Initial delay before first reconnection (1s)
      reconnectionDelayMax: 10000,      // Exponential backoff cap (max 10s between attempts)
      randomizationFactor: 0.5,        // Jitter to prevent thundering herd spikes
      timeout: 20000,                   // Connection timeout
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.io Client] Connected to real-time compliance gateway:', socket.id);
      setIsConnected(true);
      setReconnectAttempt(0);
    });

    socket.on('disconnect', (reason) => {
      console.warn('[Socket.io Client] Disconnected from compliance gateway:', reason);
      setIsConnected(false);
    });

    socket.io.on('reconnect_attempt', (attempt) => {
      console.log(`[Socket.io Client] Exponential backoff reconnect attempt #${attempt}`);
      setReconnectAttempt(attempt);
    });

    socket.io.on('reconnect', (attempt) => {
      console.log(`[Socket.io Client] Reconnected successfully after ${attempt} attempts`);
      setIsConnected(true);
      setReconnectAttempt(0);
      showToast('Real-time connection restored successfully.', 'info', 'Connection Restored', {
        category: 'Network Gateway',
        id: `recon-${Date.now()}`
      });
    });

    socket.io.on('reconnect_error', (error) => {
      console.warn('[Socket.io Client] Reconnection error during exponential backoff:', error.message);
    });

    socket.io.on('reconnect_failed', () => {
      console.error('[Socket.io Client] Reconnection failed after max attempts. Ready for manual retry.');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.warn('[Socket.io Client] Connection attempt error:', error.message);
      setIsConnected(false);
    });

    // Handle incoming real-time compliance alerts
    socket.on('compliance_alert', (data: ComplianceAlertData) => {
      console.log('[Socket.io Client] Compliance alert received:', data);
      setLastAlert(data);

      const sev = (data.severity || 'warning').toLowerCase();
      const toastType: ToastType = 
        sev === 'critical' ? 'error' : sev === 'warning' ? 'warning' : 'info';

      showToast(
        data.message,
        toastType,
        data.title || 'Real-time Compliance Alert',
        {
          category: data.category || 'Compliance Engine',
          jurisdiction: data.jurisdiction || 'EU',
          severity: sev as any,
          id: data.id || `alert-${Date.now()}`
        }
      );

      // Also register as a regulatory update if category indicates legislative update
      if (data.title && data.message) {
        const validCategories: Array<'GDPR' | 'EU AI Act' | 'Data Residency' | 'Policy Change' | 'General'> = [
          'GDPR', 'EU AI Act', 'Data Residency', 'Policy Change', 'General'
        ];
        const mappedCategory = validCategories.find(c => c.toLowerCase() === (data.category || '').toLowerCase()) || 'Policy Change';

        addRegulatoryUpdate({
          title: data.title,
          description: data.message,
          category: mappedCategory,
          severity: (sev === 'critical' ? 'critical' : sev === 'warning' ? 'warning' : 'info'),
        });
      }

      // Dispatch global DOM event for components listening to real-time updates
      window.dispatchEvent(new CustomEvent('realtimeComplianceAlert', { detail: data }));
    });

    // Handle incoming security alerts
    socket.on('security_alert', (data: ComplianceAlertData) => {
      console.log('[Socket.io Client] Security alert received:', data);
      setLastAlert(data);

      showToast(
        data.message,
        'error',
        data.title || 'Security Threat Alert',
        {
          category: data.category || 'Security Breach',
          severity: 'critical',
          id: data.id || `sec-${Date.now()}`
        }
      );

      window.dispatchEvent(new CustomEvent('realtimeSecurityAlert', { detail: data }));
    });

    // Handle system status updates
    socket.on('system_status_update', (data: SystemStatusData) => {
      console.log('[Socket.io Client] Real-time system status update:', data);
      setLatestStatus(data);
      if (data.latencyMs) {
        setLatencyMs(data.latencyMs);
      }
      window.dispatchEvent(new CustomEvent('systemStatusUpdate', { detail: data }));
    });

    return () => {
      console.log('[Socket.io Client] Cleaning up socket connection');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [showToast, addRegulatoryUpdate]);

  // Periodic Socket.io heartbeat signal for connection latency telemetry logging
  useEffect(() => {
    if (!isConnected) return;

    const performHeartbeat = () => {
      const socket = socketRef.current;
      if (!socket || !socket.connected) return;

      const startTime = Date.now();
      socket.emit('heartbeat_ping', { timestamp: startTime }, (response?: { serverTimestamp: number; clientTimestamp: number }) => {
        const roundTripMs = Math.max(1, Date.now() - startTime);
        const nowIso = new Date().toISOString();

        setLatencyMs(roundTripMs);
        setLastHeartbeat(nowIso);

        setLatestStatus(prev => prev ? {
          ...prev,
          latencyMs: roundTripMs,
          timestamp: nowIso
        } : {
          status: 'PRIMARY_ACTIVE',
          activeRegion: 'EU-West-1 (Frankfurt)',
          timestamp: nowIso,
          securityLevel: 'MAXIMUM',
          latencyMs: roundTripMs,
          complianceScore: 99.4,
          activeScans: 2
        });

        const latencyDetail = {
          latencyMs: roundTripMs,
          timestamp: nowIso,
          status: roundTripMs > 250 ? 'HIGH_LATENCY' : roundTripMs > 120 ? 'MODERATE' : 'STABLE',
          socketId: socket.id
        };

        // Broadcast to system health dashboard monitors
        window.dispatchEvent(new CustomEvent('socketHeartbeatLatency', { detail: latencyDetail }));
        window.dispatchEvent(new CustomEvent('systemStatusUpdate', { detail: {
          status: 'PRIMARY_ACTIVE',
          activeRegion: 'EU-West-1 (Frankfurt)',
          timestamp: nowIso,
          securityLevel: 'MAXIMUM',
          latencyMs: roundTripMs,
          complianceScore: 99.4,
          activeScans: 2
        } }));

        // Save latency telemetry logs into local storage for health dashboard log viewing
        try {
          const raw = localStorage.getItem('9xen-regulettee_network_latency_logs');
          const logs = raw ? JSON.parse(raw) : [];
          const newEntry = {
            id: `lat-${Date.now()}`,
            timestamp: nowIso,
            latencyMs: roundTripMs,
            status: roundTripMs > 250 ? 'HIGH_LATENCY' : 'STABLE',
            socketId: socket.id
          };
          localStorage.setItem('9xen-regulettee_network_latency_logs', JSON.stringify([newEntry, ...logs].slice(0, 50)));
        } catch (e) {
          // ignore storage errors
        }
      });
    };

    // Execute immediately on connection then every 10 seconds
    performHeartbeat();
    const interval = setInterval(performHeartbeat, 10000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const sendTestAlert = useCallback(async (alertData?: Partial<ComplianceAlertData>) => {
    try {
      const response = await fetch('/api/v1/compliance/trigger-test-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData || {
          title: 'Manual Test Compliance Alert',
          message: 'Socket.io real-time alert trigger test initiated successfully.',
          severity: 'warning',
          category: 'Socket.io Realtime'
        })
      });
      return await response.json();
    } catch (err) {
      console.error('[Socket.io Client] Error triggering test alert:', err);
      return null;
    }
  }, []);

  const manualReconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('[Socket.io Client] Initiating manual reconnection...');
      socketRef.current.connect();
    }
  }, []);

  return {
    isConnected,
    reconnectAttempt,
    latestStatus,
    lastAlert,
    latencyMs,
    lastHeartbeat,
    sendTestAlert,
    manualReconnect,
    socket: socketRef.current
  };
}
