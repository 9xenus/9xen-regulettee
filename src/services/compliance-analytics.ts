import { queryAnalytics } from '../db/duckdb';

export interface AuditLogItem {
  id: string;
  timestamp?: string;
  tenant_id?: string;
  actor_id?: string;
  service_module?: string;
  action_type: string;
  status: string;
  severity: string;
  target_resource?: string;
  ip_address?: string;
  user_agent?: string;
  payload_diff?: string | Record<string, any>;
  crypto_hash: string;
}

export interface AnalyticsSummary {
  totalLogsCount: number;
  criticalSeverityCount: number;
  warningSeverityCount: number;
  successStatusCount: number;
  failureStatusCount: number;
  uniqueTenantsCount: number;
  uniqueActorsCount: number;
}

export const ComplianceAnalyticsService = {
  /**
   * Analytical Storage Ingestion
   * Persists compliance audit logs directly to DuckDB's analytical engine.
   */
  async storeAuditLog(log: AuditLogItem): Promise<void> {
    const query = `
      INSERT INTO compliance_audit_analytics (
        id, timestamp, tenant_id, actor_id, service_module, 
        action_type, status, severity, target_resource, 
        ip_address, user_agent, payload_diff, crypto_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      log.id,
      log.timestamp || new Date().toISOString(),
      log.tenant_id || 'N/A',
      log.actor_id || 'SYSTEM',
      log.service_module || 'sys_root',
      log.action_type,
      log.status || 'SUCCESS',
      log.severity || 'INFO',
      log.target_resource || 'N/A',
      log.ip_address || '127.0.0.1',
      log.user_agent || 'NodeJS/Agent',
      typeof log.payload_diff === 'object' ? JSON.stringify(log.payload_diff) : log.payload_diff || '{}',
      log.crypto_hash
    ];

    await queryAnalytics(query, params);
  },

  /**
   * Retrieves high-level aggregations over all compliance records using DuckDB vectorized processing.
   */
  async getSystemSummary(): Promise<AnalyticsSummary> {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_count,
        COUNT(CASE WHEN severity = 'CRITICAL' THEN 1 END) as critical_count,
        COUNT(CASE WHEN severity = 'WARNING' THEN 1 END) as warning_count,
        COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) as success_count,
        COUNT(CASE WHEN status = 'DENIED' OR status = 'FAILED' THEN 1 END) as failure_count,
        COUNT(DISTINCT tenant_id) as unique_tenants,
        COUNT(DISTINCT actor_id) as unique_actors
      FROM compliance_audit_analytics
    `;

    const results = await queryAnalytics(statsQuery);
    if (!results || results.length === 0) {
      return {
        totalLogsCount: 0,
        criticalSeverityCount: 0,
        warningSeverityCount: 0,
        successStatusCount: 0,
        failureStatusCount: 0,
        uniqueTenantsCount: 0,
        uniqueActorsCount: 0
      };
    }

    const row = results[0];
    return {
      totalLogsCount: Number(row.total_count || 0),
      criticalSeverityCount: Number(row.critical_count || 0),
      warningSeverityCount: Number(row.warning_count || 0),
      successStatusCount: Number(row.success_count || 0),
      failureStatusCount: Number(row.failure_count || 0),
      uniqueTenantsCount: Number(row.unique_tenants || 0),
      uniqueActorsCount: Number(row.unique_actors || 0)
    };
  },

  /**
   * Groups compliance logs by timestamp using DuckDB's time bucket functions to compute historical trends.
   */
  async getVolumeTrends(interval: 'day' | 'hour' = 'day'): Promise<any[]> {
    const formatStr = interval === 'day' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH24:00';
    const query = `
      SELECT 
        to_char(date_trunc('${interval}', timestamp), '${formatStr}') as time_bucket,
        COUNT(*) as log_volume,
        COUNT(CASE WHEN severity = 'CRITICAL' THEN 1 END) as critical_volume,
        COUNT(CASE WHEN status = 'DENIED' OR status = 'FAILED' THEN 1 END) as denial_volume
      FROM compliance_audit_analytics
      GROUP BY time_bucket
      ORDER BY time_bucket ASC
    `;
    return queryAnalytics(query);
  },

  /**
   * Retrieves distribution of activities grouped by Service Module and Status.
   */
  async getServiceModuleDistribution(): Promise<any[]> {
    const query = `
      SELECT 
        service_module,
        status,
        COUNT(*) as log_count,
        ROUND(AVG(CASE WHEN severity = 'CRITICAL' THEN 100 ELSE 0 END), 2) as critical_ratio
      FROM compliance_audit_analytics
      GROUP BY service_module, status
      ORDER BY log_count DESC
    `;
    return queryAnalytics(query);
  },

  /**
   * Audit Trial Forensic Filters
   * Highly efficient filter/search utilizing DuckDB's indexing/vector scans.
   */
  async searchAuditLogs(filters: {
    tenantId?: string;
    actorId?: string;
    severity?: string;
    status?: string;
    serviceModule?: string;
    actionType?: string;
    searchKeyword?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<any[]> {
    let query = `
      SELECT 
        id,
        timestamp,
        tenant_id,
        actor_id,
        service_module,
        action_type,
        status,
        severity,
        target_resource,
        ip_address,
        user_agent,
        payload_diff,
        crypto_hash
      FROM compliance_audit_analytics
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.tenantId) {
      query += ` AND tenant_id = ?`;
      params.push(filters.tenantId);
    }
    if (filters.actorId) {
      query += ` AND actor_id = ?`;
      params.push(filters.actorId);
    }
    if (filters.severity) {
      query += ` AND severity = ?`;
      params.push(filters.severity.toUpperCase());
    }
    if (filters.status) {
      query += ` AND status = ?`;
      params.push(filters.status.toUpperCase());
    }
    if (filters.serviceModule) {
      query += ` AND service_module = ?`;
      params.push(filters.serviceModule);
    }
    if (filters.actionType) {
      query += ` AND action_type = ?`;
      params.push(filters.actionType);
    }
    if (filters.searchKeyword) {
      query += ` AND (
        lower(action_type) LIKE ? OR 
        lower(target_resource) LIKE ? OR 
        lower(actor_id) LIKE ? OR
        lower(payload_diff) LIKE ?
      )`;
      const wildCard = `%${filters.searchKeyword.toLowerCase()}%`;
      params.push(wildCard, wildCard, wildCard, wildCard);
    }

    query += ` ORDER BY timestamp DESC`;

    const limit = filters.limit || 50;
    query += ` LIMIT ?`;
    params.push(limit);

    if (filters.offset) {
      query += ` OFFSET ?`;
      params.push(filters.offset);
    }

    return queryAnalytics(query, params);
  },

  /**
   * Advanced Behavioral Security Analytics: Anomalous Pattern Detection.
   * Leverages advanced SQL window functions in DuckDB to flag compliance and security outliers.
   */
  async detectAnomalies(): Promise<any[]> {
    const anomalies: any[] = [];

    // Pattern 1: Rapid Denial Spikes (brute force or illegal traversal attempts)
    // 3 or more DENIED audits for the same IP address or actor within a sliding time window.
    const rapidDenialsQuery = `
      WITH indexed_denials AS (
        SELECT 
          id,
          timestamp,
          actor_id,
          ip_address,
          action_type,
          status,
          severity,
          lead(timestamp, 2) OVER (PARTITION BY ip_address ORDER BY timestamp ASC) as timestamp_two_actions_later
        FROM compliance_audit_analytics
        WHERE status = 'DENIED' OR status = 'FAILED'
      )
      SELECT 
        actor_id,
        ip_address,
        action_type,
        timestamp as event_start,
        timestamp_two_actions_later as event_end,
        epoch(timestamp_two_actions_later - timestamp) as duration_seconds
      FROM indexed_denials
      WHERE timestamp_two_actions_later IS NOT NULL 
        AND duration_seconds <= 300
      ORDER BY timestamp DESC
    `;

    // Pattern 2: Off-Hours Activity (Sovereignty and Operational Compliance breaches)
    // Audits executed during unusual working hours (10:00 PM to 05:00 AM local server time).
    const offHoursQuery = `
      SELECT 
        id,
        timestamp,
        actor_id,
        service_module,
        action_type,
        status,
        severity,
        ip_address,
        hour(timestamp) as hour_of_day
      FROM compliance_audit_analytics
      WHERE hour_of_day >= 22 OR hour_of_day <= 5
      ORDER BY timestamp DESC
      LIMIT 20
    `;

    // Pattern 3: High Volume Actions Spike
    // Identifies days where a specific actor or module executes 200% more events than their trailing median.
    const activitySpikeQuery = `
      WITH daily_actor_volume AS (
        SELECT 
          CAST(timestamp AS DATE) as log_date,
          actor_id,
          COUNT(*) as daily_volume
        FROM compliance_audit_analytics
        GROUP BY log_date, actor_id
      ),
      actor_medians AS (
        SELECT 
          actor_id,
          median(daily_volume) as median_volume
        FROM daily_actor_volume
        GROUP BY actor_id
      )
      SELECT 
        v.log_date,
        v.actor_id,
        v.daily_volume,
        m.median_volume,
        ROUND((v.daily_volume::DOUBLE / m.median_volume::DOUBLE) * 100, 2) as spike_percentage
      FROM daily_actor_volume v
      JOIN actor_medians m ON v.actor_id = m.actor_id
      WHERE v.daily_volume > 15 AND v.daily_volume > (m.median_volume * 3)
      ORDER BY spike_percentage DESC
      LIMIT 15
    `;

    try {
      const [denials, offHours, spikes] = await Promise.all([
        queryAnalytics(rapidDenialsQuery),
        queryAnalytics(offHoursQuery),
        queryAnalytics(activitySpikeQuery)
      ]);

      denials.forEach(d => {
        anomalies.push({
          type: 'RAPID_DENIAL_SPIKE',
          title: 'Potential Access Abuse Blocked',
          description: `Rapid access denials detected for actor/IP: ${d.actor_id || d.ip_address}. 3+ denials in ${Math.round(d.duration_seconds)}s.`,
          severity: 'HIGH',
          timestamp: d.event_start,
          meta: d
        });
      });

      offHours.forEach(oh => {
        anomalies.push({
          type: 'OFF_HOURS_ACTIVITY',
          title: 'Suspicious Off-Hours Compliance Event',
          description: `Audit event '${oh.action_type}' initiated by ${oh.actor_id} at unusual hour (${oh.hour_of_day}:00).`,
          severity: oh.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
          timestamp: oh.timestamp,
          meta: oh
        });
      });

      spikes.forEach(s => {
        anomalies.push({
          type: 'VOLUME_SPIKE_DETECTION',
          title: 'Anomalous Activity Spike Detected',
          description: `Actor '${s.actor_id}' initiated ${s.daily_volume} audit events, representing a ${s.spike_percentage}% spike over their median.`,
          severity: 'INFO',
          timestamp: new Date(s.log_date).toISOString(),
          meta: s
        });
      });

    } catch (err: any) {
      console.error('[ANOMALY_DETECTOR] Outlier querying failed:', err);
    }

    // Sort anomalies newest first
    return anomalies.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
};
