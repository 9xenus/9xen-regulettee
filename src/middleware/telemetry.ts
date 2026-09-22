import { Request, Response, NextFunction } from 'express';

// Mocking OpenTelemetry metrics tracking
const metrics = {
  activeRequests: 0,
  recordLatency: (route: string, durationMs: number) => {
    // Exporter push to Prometheus or Datadog
    console.log(`[APM] Route: ${route} | Latency: ${durationMs}ms`);
  },
  incrementError: (route: string, statusCode: number) => {
    console.log(`[APM] ERROR | Route: ${route} | Status: ${statusCode}`);
  }
};

/**
 * Enterprise Application Performance Monitoring (APM) & Telemetry Middleware.
 * Instruments API endpoints to record processing latency, throughput, and error rates
 * to populate the real-time Line Charts on the Platform Admin Dashboard.
 */
export const telemetryMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startHrTime = process.hrtime();
  metrics.activeRequests++;

  // Capture original res.end to trace exactly when the request finishes
  const originalEnd = res.end;

  // @ts-ignore
  res.end = function(...args: any[]) {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedMs = (elapsedHrTime[0] * 1000) + (elapsedHrTime[1] / 1e6);

    const routeRef = req.route ? req.baseUrl + req.route.path : req.url;
    
    // Log performance metrics
    metrics.recordLatency(routeRef, Math.round(elapsedMs));

    if (res.statusCode >= 400) {
      metrics.incrementError(routeRef, res.statusCode);
    }

    metrics.activeRequests--;

    return (originalEnd as any).apply(this, args);
  };

  next();
};
