import { Request, Response, NextFunction } from 'express';

export class DBFailoverState {
  static isPrimaryDown: boolean = false;
  static lastHealthCheck: Date = new Date();
  
  static triggerFailover() {
    this.isPrimaryDown = !this.isPrimaryDown;
    console.log(`[DR_MONITOR] Simulated Failover State Changed: Primary is now ${this.isPrimaryDown ? 'DOWN' : 'UP'}`);
  }

  // Health check polling mechanism (Conceptual)
  static startHealthMonitor() {
    setInterval(async () => {
      try {
        // e.g. await primaryDb.$queryRaw\`SELECT 1\`;
        // If query succeeds, restore primary state
        if (this.isPrimaryDown) {
          console.log('[DR_MONITOR] Primary DB (eu-central-1) recovered. Restoring standard routing.');
          this.isPrimaryDown = false;
        }
      } catch (error) {
        if (!this.isPrimaryDown) {
          console.error('[DR_MONITOR] CRITICAL: Primary DB failure detected. Engaging failover to eu-west-1 replica.');
          this.isPrimaryDown = true;
          // Trigger APM / Notification directly to Super Admin
        }
      }
      this.lastHealthCheck = new Date();
    }, 5000); // Check every 5 seconds
  }
}

/**
 * Database Replication & Automated Disaster Recovery (DR) Failover Middleware
 * Application-level high-availability fallback interceptor.
 * Routes read-only traffic to replicas automatically if the primary drops,
 * buffering or rejecting heavy writes with a clean error.
 */
export const drFailoverMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Inject intelligent routing hints into the request object
    (req as any).dbRouting = {
      target: DBFailoverState.isPrimaryDown ? 'REPLICA_EU_WEST_1' : 'PRIMARY_EU_CENTRAL_1',
      readonly: false
    };

    if (DBFailoverState.isPrimaryDown) {
      // It's a write mutation (POST, PUT, DELETE, PATCH)
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        
        // Optionally: Send to internal temporary queue buffer instead of rejecting
        // await queueManager.addToBuffer(req);

        // Or reject safely
        res.setHeader('Retry-After', '60'); // Tell clients to retry in 60s
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'The compliance ledger is currently undergoing automated Disaster Recovery failover. Read-only queries are active. Write operations are temporarily suspended to strictly protect data integrity.',
          routingState: 'REPLICA_FALLBACK'
        });
      }
      
      // For GET requests, flag to utilize the Read-Replica connection pool
      (req as any).dbRouting.readonly = true;
    }

    next();
  };
};
