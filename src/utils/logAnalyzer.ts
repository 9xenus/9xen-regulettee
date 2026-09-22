/**
 * System Error Log Analysis Utility
 * Analyzes system error logs and detects unusual patterns such as high-frequency error bursts,
 * repeated error signatures, or cascading failures within a specified time window.
 */

export interface SystemErrorLogEntry {
  id?: string;
  timestamp: string;
  errorMessage?: string;
  message?: string;
  level?: string;
  activePath?: string;
  stack?: string;
  status?: string;
  retryCount?: number;
}

export interface LogAnalysisResult {
  isUnusual: boolean;
  anomalyType: 'HIGH_FREQUENCY_BURST' | 'REPEATED_SIGNATURE' | 'CASCADING_FAILURE' | 'NORMAL';
  errorCountInWindow: number;
  timeWindowMinutes: number;
  summary: string;
  frequentSignatures: { signature: string; count: number }[];
  recommendation: string;
}

export type LogSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface LogTriageResult {
  logId: string;
  severity: LogSeverity;
  severityScore: number; // 0 - 100
  category: string;
  signature: string;
  matchedKeywords: string[];
  recommendedAction: string;
  aiRemediation: string;
  triagedAt: string;
}

export function deriveAiRemediationAction(normMsg: string, signature: string, path: string = ''): string {
  const combined = `${normMsg} ${signature} ${path}`.toLowerCase();

  // 1. Rate Limiting & Throttling
  if (combined.includes('rate limit') || combined.includes('429') || combined.includes('throttl') || combined.includes('too many requests')) {
    return 'Check API Rate Limit & Implement Exponential Backoff';
  }

  // 2. Authentication & Session Expired
  if (combined.includes('jwt') || combined.includes('token expired') || combined.includes('unauthorized') || combined.includes('401') || combined.includes('auth token') || combined.includes('bearer') || combined.includes('stale session')) {
    return 'Re-validate Auth Token & Refresh User Credentials';
  }

  // 3. Authorization & RBAC
  if (combined.includes('forbidden') || combined.includes('403') || combined.includes('access denied') || combined.includes('insufficient permission') || combined.includes('privilege') || combined.includes('rbac') || combined.includes('unauthorized role')) {
    return 'Audit RBAC Role Scopes & Grant Required Permissions';
  }

  // 4. Missing Route or Resource
  if (combined.includes('404') || combined.includes('not found') || combined.includes('cannot get') || combined.includes('cannot post') || combined.includes('no such route') || combined.includes('route:')) {
    return 'Verify Endpoint Route Definition & Handler Registration';
  }

  // 5. Database, SQLite & Concurrency Locks
  if (combined.includes('sqlite_busy') || combined.includes('database locked') || combined.includes('deadlock') || combined.includes('sql') || combined.includes('foreign key') || combined.includes('prisma') || combined.includes('corruption')) {
    return 'Release Database Transaction Locks & Verify Table Schema';
  }

  // 6. Network Gateway & Service Health
  if (combined.includes('econnrefused') || combined.includes('504') || combined.includes('502') || combined.includes('503') || combined.includes('gateway timeout') || combined.includes('connection refused') || combined.includes('etimedout') || combined.includes('fetch failed')) {
    return 'Check Backend Gateway Health & Downstream Service Connectivity';
  }

  // 7. Internal Server Error (500)
  if (combined.includes('500') || combined.includes('internal server error')) {
    return 'Inspect Server Route Handler & Check Process Exception Logs';
  }

  // 8. Quota & Memory/Storage Exhaustion
  if (combined.includes('quota') || combined.includes('resource_exhausted') || combined.includes('out of memory') || combined.includes('disk full') || combined.includes('enospc') || combined.includes('heap')) {
    return 'Expand Storage/Quota Capacity & Flush Transient Cache Logs';
  }

  // 9. Frontend Runtime TypeErrors & Nullish Props
  if (combined.includes('typeerror') || combined.includes('cannot read property') || combined.includes('cannot read properties') || combined.includes('null is not an object') || combined.includes('undefined is not')) {
    return 'Add Nullish Coalescing Checks & Safeguard Optional UI Props';
  }

  // 10. React Render Loops
  if (combined.includes('render loop') || combined.includes('maximum call stack') || combined.includes('too many re-renders') || combined.includes('infinite loop')) {
    return 'Audit React useEffect Dependencies & Eliminate State Cycles';
  }

  // 11. Sovereign Consent & CMP Verification
  if (combined.includes('consent') || combined.includes('cmp') || combined.includes('cookie')) {
    return 'Verify CMP Consent Ledger & Cryptographic Proof Records';
  }

  // 12. Cryptographic Signatures & Vault Keys
  if (combined.includes('crypto') || combined.includes('signature') || combined.includes('merkle') || combined.includes('tamper') || combined.includes('checksum') || combined.includes('vault') || combined.includes('encryption')) {
    return 'Re-generate Cryptographic Signature & Audit Ledger Proof Integrity';
  }

  // 13. Schema Validation & Input Format
  if (combined.includes('validation') || combined.includes('invalid input') || combined.includes('parse error') || combined.includes('syntax error') || combined.includes('schema error') || combined.includes('400') || combined.includes('bad request')) {
    return 'Sanitize Request Payload Schema & Revalidate Form Inputs';
  }

  // 14. Chunk Loading & Dynamic Imports
  if (combined.includes('chunkloaderror') || combined.includes('loading chunk') || combined.includes('dynamic import')) {
    return 'Purge Browser Cache & Force Asset Bundle Reload';
  }

  // 15. Fatal / Panic
  if (combined.includes('fatal') || combined.includes('panic') || combined.includes('crash') || combined.includes('kernel')) {
    return 'Execute Emergency Snapshot & Inspect Core Crash Dump';
  }

  return 'Monitor Telemetry & Apply Automatic Error Recovery';
}

export interface AutoTriageSummary {
  triagedAt: string;
  totalAnalyzed: number;
  severityCounts: {
    Critical: number;
    High: number;
    Medium: number;
    Low: number;
  };
  dominantCategory: string;
  averageScore: number;
  overallRiskLevel: LogSeverity;
  summaryMessage: string;
  topActionItem: string;
  resultsByLogId: Record<string, LogTriageResult>;
}

export function autoTriageSingleLog(log: SystemErrorLogEntry, index: number = 0): LogTriageResult {
  const logId = log.id || `log-${index}-${Date.now()}`;
  const rawMsg = log.errorMessage || log.message || 'Unknown system event';
  const normMsg = rawMsg.toLowerCase().trim();
  const level = (log.level || 'ERROR').toUpperCase();
  const signature = rawMsg.replace(/\s+/g, ' ').trim().substring(0, 100);
  const matchedKeywords: string[] = [];

  let severityScore = 25;
  let category = 'General System';
  let recommendedAction = 'Monitor system logs for recurrent occurrences.';

  // Critical Pattern Rules
  const criticalRules = [
    { kw: ['fatal', 'crash', 'kernel', 'unhandled exception', 'panic'], cat: 'Fatal Runtime Crash', score: 98, action: 'Immediate developer triage required. Check memory dump & crash logs.' },
    { kw: ['security', 'breach', 'unauthorized', 'forbidden', 'access denied', 'vault', 'encryption', 'exfiltration', 'tampering', 'privilege'], cat: 'Security & Access Control', score: 95, action: 'Initiate Security Incident Response. Audit active user session tokens.' },
    { kw: ['quota', 'resource_exhausted', 'out of memory', 'disk full', 'sqlite_busy', 'database locked', 'deadlock', 'corruption'], cat: 'Infrastructure & Resource Exhaustion', score: 90, action: 'Free storage capacity or scale system instance quota immediately.' },
    { kw: ['cascading', 'render loop', 'maximum call stack', 'too many re-renders'], cat: 'Cascading Render Loop', score: 88, action: 'Inspect React component useEffect dependency arrays for state feedback loops.' }
  ];

  // High Pattern Rules
  const highRules = [
    { kw: ['500', 'internal server error', 'gateway timeout', '504', '502', 'connection refused', 'econnrefused', 'etimedout', 'fetch failed'], cat: 'Network & Backend API Failure', score: 80, action: 'Check backend server health, endpoint status, and network connectivity.' },
    { kw: ['typeerror', 'cannot read property', 'cannot read properties', 'null is not an object', 'undefined is not', 'chunkloaderror'], cat: 'Frontend Runtime Execution', score: 75, action: 'Inspect component props and add nullish checks or fallback UI error boundaries.' },
    { kw: ['snapshot failed', 'sync failed', 'state corruption', 'transaction failed'], cat: 'State Synchronization Engine', score: 72, action: 'Purge corrupted cache or verify local storage serialization boundaries.' }
  ];

  // Medium Pattern Rules
  const mediumRules = [
    { kw: ['404', 'not found', '400', 'bad request', 'validation', 'invalid input', 'parse error', 'syntax error', 'schema error'], cat: 'Data & Schema Validation', score: 55, action: 'Verify incoming API payload parameters or form input validation schema.' },
    { kw: ['rate limit', '429', 'throttled', 'too many requests', 'backoff'], cat: 'API Rate Limits & Throttling', score: 50, action: 'Apply exponential backoff or increase rate limit thresholds.' },
    { kw: ['cache miss', 'localstorage', 'stale session', 'token expired'], cat: 'Client Cache & Session State', score: 45, action: 'Re-authenticate user or refresh client-side token cache.' }
  ];

  // Evaluate Critical Rules
  for (const rule of criticalRules) {
    for (const kw of rule.kw) {
      if (normMsg.includes(kw)) {
        matchedKeywords.push(kw);
        category = rule.cat;
        severityScore = rule.score;
        recommendedAction = rule.action;
        break;
      }
    }
    if (matchedKeywords.length > 0) break;
  }

  // Evaluate High Rules
  if (matchedKeywords.length === 0) {
    for (const rule of highRules) {
      for (const kw of rule.kw) {
        if (normMsg.includes(kw)) {
          matchedKeywords.push(kw);
          category = rule.cat;
          severityScore = rule.score;
          recommendedAction = rule.action;
          break;
        }
      }
      if (matchedKeywords.length > 0) break;
    }
  }

  // Evaluate Medium Rules
  if (matchedKeywords.length === 0) {
    for (const rule of mediumRules) {
      for (const kw of rule.kw) {
        if (normMsg.includes(kw)) {
          matchedKeywords.push(kw);
          category = rule.cat;
          severityScore = rule.score;
          recommendedAction = rule.action;
          break;
        }
      }
      if (matchedKeywords.length > 0) break;
    }
  }

  // Modifiers based on level, status, or retry count
  if (log.status === 'FAILED_MAX_RETRIES') {
    severityScore = Math.min(100, severityScore + 10);
  }
  if ((log.retryCount || 0) >= 3) {
    severityScore = Math.min(100, severityScore + 8);
  }
  if (level === 'CRITICAL') {
    severityScore = Math.max(85, severityScore);
  } else if (level === 'WARNING' && severityScore > 65) {
    severityScore = 60; // Cap warning level logs
  }

  // Map score to Severity Category
  let severity: LogSeverity = 'Low';
  if (severityScore >= 85) {
    severity = 'Critical';
  } else if (severityScore >= 65) {
    severity = 'High';
  } else if (severityScore >= 40) {
    severity = 'Medium';
  } else {
    severity = 'Low';
  }

  const aiRemediation = deriveAiRemediationAction(normMsg, signature, log.activePath || '');

  return {
    logId,
    severity,
    severityScore,
    category,
    signature,
    matchedKeywords: matchedKeywords.length > 0 ? matchedKeywords : ['general-signature'],
    recommendedAction,
    aiRemediation,
    triagedAt: new Date().toISOString()
  };
}

export function autoTriageLogs(logs: SystemErrorLogEntry[]): AutoTriageSummary {
  const resultsByLogId: Record<string, LogTriageResult> = {};
  const severityCounts = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0
  };

  const categoryCounts: Record<string, number> = {};
  let totalScore = 0;

  logs.forEach((log, idx) => {
    const result = autoTriageSingleLog(log, idx);
    resultsByLogId[result.logId] = result;
    severityCounts[result.severity]++;
    categoryCounts[result.category] = (categoryCounts[result.category] || 0) + 1;
    totalScore += result.severityScore;
  });

  const totalAnalyzed = logs.length;
  const averageScore = totalAnalyzed > 0 ? Math.round(totalScore / totalAnalyzed) : 0;

  // Find dominant category
  let dominantCategory = 'General System';
  let maxCatCount = 0;
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count > maxCatCount) {
      maxCatCount = count;
      dominantCategory = cat;
    }
  });

  // Determine overall risk level
  let overallRiskLevel: LogSeverity = 'Low';
  if (severityCounts.Critical > 0 || averageScore >= 80) {
    overallRiskLevel = 'Critical';
  } else if (severityCounts.High > 0 || averageScore >= 60) {
    overallRiskLevel = 'High';
  } else if (severityCounts.Medium > 0 || averageScore >= 35) {
    overallRiskLevel = 'Medium';
  }

  let summaryMessage = `Auto-triage completed for ${totalAnalyzed} logs. `;
  if (severityCounts.Critical > 0) {
    summaryMessage += `⚠️ ${severityCounts.Critical} CRITICAL security/system errors detected that require immediate mitigation.`;
  } else if (severityCounts.High > 0) {
    summaryMessage += `⚡ ${severityCounts.High} High-priority issues flagged across ${dominantCategory}.`;
  } else if (severityCounts.Medium > 0) {
    summaryMessage += `ℹ️ ${severityCounts.Medium} Medium-priority validation/network anomalies triaged.`;
  } else {
    summaryMessage += `✅ All visible logs are classified as Low severity operational notices.`;
  }

  // Find top action item from highest severity log
  let topActionItem = 'System operating within acceptable parameters.';
  const criticalLog = Object.values(resultsByLogId).find(r => r.severity === 'Critical');
  const highLog = Object.values(resultsByLogId).find(r => r.severity === 'High');
  const mediumLog = Object.values(resultsByLogId).find(r => r.severity === 'Medium');

  if (criticalLog) {
    topActionItem = `[CRITICAL] AI Remediation: ${criticalLog.aiRemediation} — ${criticalLog.recommendedAction}`;
  } else if (highLog) {
    topActionItem = `[HIGH] AI Remediation: ${highLog.aiRemediation} — ${highLog.recommendedAction}`;
  } else if (mediumLog) {
    topActionItem = `[MEDIUM] AI Remediation: ${mediumLog.aiRemediation} — ${mediumLog.recommendedAction}`;
  }

  return {
    triagedAt: new Date().toISOString(),
    totalAnalyzed,
    severityCounts,
    dominantCategory,
    averageScore,
    overallRiskLevel,
    summaryMessage,
    topActionItem,
    resultsByLogId
  };
}

export function analyzeSystemLogsForAnomalies(
  logs: SystemErrorLogEntry[],
  windowMinutes: number = 10,
  frequencyThreshold: number = 3
): LogAnalysisResult {
  if (!logs || logs.length === 0) {
    return {
      isUnusual: false,
      anomalyType: 'NORMAL',
      errorCountInWindow: 0,
      timeWindowMinutes: windowMinutes,
      summary: 'No system error logs recorded.',
      frequentSignatures: [],
      recommendation: 'System is operating normally.'
    };
  }

  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  
  // Filter logs within the time window
  const recentLogs = logs.filter(log => {
    if (!log.timestamp) return false;
    const ts = new Date(log.timestamp).getTime();
    return !isNaN(ts) && (now - ts <= windowMs);
  });

  const errorCountInWindow = recentLogs.length;

  // Group by message signature (normalized)
  const signatureCounts: Record<string, number> = {};
  recentLogs.forEach(log => {
    const rawMsg = log.errorMessage || log.message || 'Unknown error';
    const normalizedSig = rawMsg.trim().replace(/\s+/g, ' ').substring(0, 90);
    signatureCounts[normalizedSig] = (signatureCounts[normalizedSig] || 0) + 1;
  });

  const frequentSignatures = Object.entries(signatureCounts)
    .map(([signature, count]) => ({ signature, count }))
    .sort((a, b) => b.count - a.count);

  const topSignature = frequentSignatures[0];
  const isHighFrequency = errorCountInWindow >= frequencyThreshold;
  const isRepeatedSignature = topSignature && topSignature.count >= 3;

  let isUnusual = false;
  let anomalyType: LogAnalysisResult['anomalyType'] = 'NORMAL';
  let summary = 'Standard error frequency within normal operating thresholds.';
  let recommendation = 'No immediate intervention required.';

  if (isHighFrequency && isRepeatedSignature) {
    isUnusual = true;
    anomalyType = 'CASCADING_FAILURE';
    summary = `Critical anomaly detected: ${errorCountInWindow} errors occurred within the last ${windowMinutes} minutes, with "${topSignature.signature}" repeating ${topSignature.count} times.`;
    recommendation = 'Investigate upstream services, API timeouts, or potential circular component render loops immediately.';
  } else if (isHighFrequency) {
    isUnusual = true;
    anomalyType = 'HIGH_FREQUENCY_BURST';
    summary = `High-frequency error burst detected: ${errorCountInWindow} system errors recorded in the last ${windowMinutes} minutes.`;
    recommendation = 'Check network stability, API rate limits, or recent state changes.';
  } else if (isRepeatedSignature) {
    isUnusual = true;
    anomalyType = 'REPEATED_SIGNATURE';
    summary = `Repeated error signature pattern: "${topSignature.signature}" has occurred ${topSignature.count} times recently.`;
    recommendation = 'Review component props or input validation logic for persistent failure.';
  }

  return {
    isUnusual,
    anomalyType,
    errorCountInWindow,
    timeWindowMinutes: windowMinutes,
    summary,
    frequentSignatures,
    recommendation
  };
}
