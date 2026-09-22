/**
 * Global Error Normalization Utility
 * Maps backend (FastAPI/Express) error states to descriptive, actionable UI error objects.
 */

export interface NormalizedError {
  code: string;
  message: string;
  detail?: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  actionable?: boolean;
  recoveryHint?: string;
  statusCode: number;
}

/**
 * Normalizes non-2xx responses from the FastAPI backend into standard 9Xen Regulettee error objects.
 */
export function normalizeBackendError(error: any): NormalizedError {
  const statusCode = error.status || error.response?.status || 500;
  const rawData = error.data || error.response?.data || {};
  
  const detail = rawData.detail || rawData.error || error.message || 'Unknown system error';
  
  let normalized: NormalizedError = {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'A critical backend connectivity issue occurred.',
    detail,
    severity: 'CRITICAL',
    statusCode,
    actionable: true,
    recoveryHint: 'Wait 30 seconds and retry the operation.'
  };

  // Specific Mapping based on FastAPI/Express status codes
  switch (statusCode) {
    case 401:
      normalized.code = 'UNAUTHORIZED';
      normalized.message = 'Sovereign Session Expired';
      normalized.detail = 'Your cryptographic authentication token is either invalid or has expired due to session inactivity.';
      normalized.recoveryHint = 'Re-authenticate via the Quantum Gateway to restore access.';
      normalized.severity = 'WARNING';
      break;
    case 403:
      normalized.code = 'FORBIDDEN';
      normalized.message = 'Access Denied: Insufficient Privileges';
      normalized.detail = 'Your current IAM role lacks the necessary permissions for this enclave operation. Access is restricted by Regional Sovereignty rules.';
      normalized.recoveryHint = 'Contact your Regional Data Protection Officer (DPO) to upgrade your role privileges.';
      break;
    case 404:
      normalized.code = 'NOT_FOUND';
      normalized.message = 'Resource Unreachable';
      normalized.detail = 'The requested compliance endpoint or data record does not exist on the sovereign ledger.';
      normalized.recoveryHint = 'Verify the URL or resource ID and ensure the regional node is synchronized.';
      break;
    case 409:
      normalized.code = 'CONFLICT';
      normalized.message = 'Resource State Conflict';
      normalized.detail = 'The operation conflicts with an existing state on the ledger (e.g. duplicate proof-of-consent).';
      normalized.recoveryHint = 'Refresh your local state and retry the operation.';
      break;
    case 422:
      normalized.code = 'VALIDATION_ERROR';
      normalized.message = 'Compliance Data Schema Mismatch';
      normalized.detail = Array.isArray(rawData.detail) 
        ? rawData.detail.map((d: any) => `${d.loc.join('.')}: ${d.msg}`).join('; ') 
        : (rawData.message || normalized.detail);
      normalized.severity = 'WARNING';
      normalized.recoveryHint = 'Check the regulatory schema requirements and correct the input data.';
      break;
    case 429:
      normalized.code = 'RATE_LIMITED';
      normalized.message = 'Compliance Quota Exceeded';
      normalized.detail = 'Maximum API request threshold reached for your tenant tier. Rate limiting active for platform stability.';
      normalized.recoveryHint = 'Reduce request frequency or upgrade to the CaaS Enterprise VIP tier.';
      normalized.severity = 'WARNING';
      break;
    case 500:
      normalized.code = 'BACKEND_CRASH';
      normalized.message = 'Sovereign Engine Critical Failure';
      normalized.detail = detail || 'The backend risk assessment engine encountered an unhandled exception during processing.';
      normalized.recoveryHint = 'The engineering team has been notified. Please try again in 5 minutes.';
      break;
    case 502:
    case 503:
    case 504:
      normalized.code = 'BACKEND_TIMEOUT';
      normalized.message = 'Compliance Gateway Timeout';
      normalized.detail = 'The long-running scan operation or regional sync timed out. The backend service may be overloaded or unreachable.';
      normalized.recoveryHint = 'Check the System Health dashboard for node status or increase the client-side timeout.';
      break;
  }

  return normalized;
}
