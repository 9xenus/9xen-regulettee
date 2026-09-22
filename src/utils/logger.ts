let winston: any;
import { WebhookForwardingTransport } from './webhookTransport';
if (typeof window === 'undefined') {
  try {
    if (typeof require !== 'undefined') {
      winston = require('winston');
    }
  } catch {}
  if (!winston) {
    import('winston').then(m => {
      winston = m.default || m;
    }).catch(() => {});
  }
}

import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

// Define log directory
const LOG_DIR = typeof window === 'undefined' ? path.join(process.cwd(), 'logs') : '';

// Helper to mask PII (GDPR compliance rule)
export function sanitizeLogData(data: any): any {
  if (!data) return data;
  if (typeof data !== 'object') return data;

  const sensitiveKeys = [
    'password', 'password_hash', 'token', 'secret', 'apiKey', 'api_key', 
    'credit_card', 'cardNumber', 'cvv', 'ssn', 'taxId', 'email'
  ];

  const sanitized = { ...data };
  for (const key in sanitized) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[MASKED_FOR_GDPR_COMPLIANCE]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  }
  return sanitized;
}

// Configure Winston Logger or Mock
let internalLogger: any;

if (typeof window === 'undefined' && winston) {
  // Custom format to pretty-print console compliance logs elegantly
  const consoleFormat = winston.format.printf(({ level, message, timestamp, service, ...meta }: any) => {
    const metaString = Object.keys(meta).length ? `\n  Meta: ${JSON.stringify(sanitizeLogData(meta), null, 2)}` : '';
    const isCompliance = meta.complianceEvent;
    const levelTag = isCompliance ? `\x1b[45m\x1b[37m COMPLIANCE \x1b[0m` : `[${level}]`;
    return `${timestamp} ${levelTag} [${service || 'system'}]: ${message}${metaString}`;
  });

  const transports: any[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        consoleFormat
      )
    })
  ];

  if (LOG_DIR) {
    try {
      if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
      }
      transports.push(
        new winston.transports.File({
          filename: path.join(LOG_DIR, 'combined.log'),
          maxsize: 5242880,
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: path.join(LOG_DIR, 'compliance-audit.log'),
          level: 'info',
          maxsize: 10485760,
          maxFiles: 10,
        })
      );
    } catch (e) {
      console.warn('Could not initialize log files:', e);
    }
  }

  try {
    transports.push(new WebhookForwardingTransport());
  } catch (e) {
    console.warn('Could not attach WebhookForwardingTransport:', e);
  }

  internalLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.json()
    ),
    defaultMeta: { service: '9xen-regulettee-caas' },
    transports
  });
} else {
  // Mock for client
  const mockFn = () => {};
  internalLogger = {
    info: mockFn,
    warn: mockFn,
    error: mockFn,
    log: mockFn,
    debug: mockFn
  };
}

export const logger = internalLogger;

// Structured Interface for auditable GDPR compliance event triggers
export interface ComplianceLogDetails {
  eventType: 'ACCESS_GRANTED' | 'ACCESS_DENIED' | 'DATA_EXPORT' | 'DATA_DELETION' | 'CONSENT_UPDATE' | 'POLICY_VIOLATION' | 'DSAR_TRIGGERED' | 'ENCLAVE_COMPILATION';
  category: 'GDPR' | 'AI_ACT' | 'DORA' | 'NIS2' | 'GENERAL';
  tenantId: string;
  actor: string; // The identity of the admin, client, user or API key that triggered the event
  resource: string; // Target entity (e.g. "tenant_records_v1", "user_consent_table")
  action: string; // Detailed description of action
  ipAddress?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILURE';
  additionalMeta?: Record<string, any>;
}

// Direct auditable logger for compliance events
export const logCompliance = (details: ComplianceLogDetails) => {
  const sanitizedMeta = sanitizeLogData(details.additionalMeta);
  
  logger.info(`Compliance Audit Triggered: [${details.eventType}] - ${details.action}`, {
    complianceEvent: true,
    eventType: details.eventType,
    category: details.category,
    tenantId: details.tenantId,
    actor: details.actor,
    resource: details.resource,
    ipAddress: details.ipAddress || 'unknown',
    userAgent: details.userAgent || 'unknown',
    status: details.status,
    timestamp: new Date().toISOString(),
    meta: sanitizedMeta
  });
};

// Express Request Logging Middleware
export const expressRequestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const tenantId = (req.headers['x-tenant-id'] as string) || 'DEFAULT_TENANT';
  const actor = (req.headers['x-user-id'] as string) || 'anonymous';

  // Attach listener to capture response details on complete
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logDetails = {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTimeMs: duration,
      ipAddress,
      userAgent,
      tenantId,
      actor,
      apiCall: true
    };

    if (res.statusCode >= 500) {
      logger.error(`HTTP API Error: ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`, logDetails);
    } else if (res.statusCode >= 400) {
      logger.warn(`HTTP API Warning: ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`, logDetails);
    } else {
      logger.info(`HTTP API Request: ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`, logDetails);
    }
  });

  next();
};
