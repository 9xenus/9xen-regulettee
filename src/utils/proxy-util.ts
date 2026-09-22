import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Request } from 'express';
import crypto from 'crypto';
import { logger } from './logger';
import { normalizeBackendError } from './error-normalization';

const FASTAPI_BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://127.0.0.1:8080';

/**
 * Robust Proxy Utility for communicating with the FastAPI backend.
 * Handles auth header forwarding, timeouts, and logging with global error normalization.
 */
export async function proxyToBackend(
  req: Request,
  endpoint: string,
  options: AxiosRequestConfig = {}
): Promise<AxiosResponse> {
  const url = `${FASTAPI_BACKEND_URL}${endpoint}`;
  
  // Configure request with robust defaults and explicit timeouts for long-running RegTech scans
  const config: AxiosRequestConfig = {
    ...options,
    method: options.method || req.method,
    url,
    headers: {
      'Authorization': req.headers['authorization'],
      'x-tenant-id': (req.headers['x-tenant-id'] as string) || (req as any).tenantContext,
      'x-request-id': (req.headers['x-request-id'] as string) || `req_${crypto.randomUUID()}`,
      'x-compliance-enclave': '9XEN_REGULETTEE_PRIMARY',
      'Content-Type': 'application/json',
      'User-Agent': '9Xen Regulettee-API-Gateway/1.0',
      ...options.headers
    } as any,
    data: options.data || req.body,
    timeout: options.timeout || 30000
  };

  try {
    logger.info(`[PROXY] Forwarding ${req.method} ${req.originalUrl} to ${url}`);
    const response = await axios(config);
    return response;
  } catch (error: any) {
    // Normalize the error using the global utility
    const normalized = normalizeBackendError(error);
    
    logger.error(`[PROXY] Backend error normalized: ${normalized.code} (${normalized.statusCode}) - ${normalized.detail}`);
    
    // Throw an enhanced error that includes the normalized structure
    const enhancedError: any = new Error(normalized.message);
    enhancedError.status = normalized.statusCode;
    enhancedError.normalized = normalized;
    enhancedError.originalData = error.response?.data;
    
    throw enhancedError;
  }
}
