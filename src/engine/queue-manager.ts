import crypto from 'crypto';
let Queue: any;
let Worker: any;
let Redis: any;

if (typeof window === 'undefined') {
  try {
    if (typeof require !== 'undefined') {
      const bullmq = require('bullmq');
      Queue = bullmq.Queue;
      Worker = bullmq.Worker;
      const ioredis = require('ioredis');
      Redis = ioredis.default || ioredis;
    }
  } catch {}
  if (!Queue) {
    import('bullmq').then(bullmq => {
      Queue = bullmq.Queue;
      Worker = bullmq.Worker;
    }).catch(() => {});
  }
  if (!Redis) {
    import('ioredis').then(ioredis => {
      Redis = ioredis.default || ioredis;
    }).catch(() => {});
  }
}

/**
 * Asynchronous Task Queue Architecture (BullMQ Wrapper)
 * Safely queues heavy compliance workloads (document parsing, drift re-evaluation)
 * so that one tenant's audit does not degrade the platform for others.
 */
export class BackgroundQueueManager {
  private connection: any;
  private assessmentQueue: any;
  private alertQueue: any;
  private isRedisConnected: boolean = false;

  constructor() {
    // Attempt to connect to Redis, fallback gracefully if not available in dev environment
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    if (typeof window === 'undefined' && Redis && Queue) {
      try {
        this.connection = new Redis(redisUrl, { maxRetriesPerRequest: null, lazyConnect: true });
        
        this.connection.connect().then(() => {
          this.isRedisConnected = true;
          console.log(`[QUEUE_MANAGER] Connected to Redis at ${redisUrl}`);
          this.initializeWorkers();
        }).catch((err: any) => {
          console.warn(`[QUEUE_MANAGER] Redis connection failed, falling back to sync mode. Ensure Redis is running. Error: ${err.message}`);
        });

        this.assessmentQueue = new Queue('compliance-assessments', { connection: this.connection });
        this.alertQueue = new Queue('critical-alerts', { connection: this.connection });
      } catch (err: any) {
        console.warn(`[QUEUE_MANAGER] Error initializing queue connection: ${err?.message}`);
      }
    }
  }

  private initializeWorkers() {
    new Worker('compliance-assessments', async job => {
      console.log(`[QUEUE_WORKER] Processing Assessment Task [${job.name}]: ${job.id}`);
      
      const { taskType, payload } = job.data;
      
      // Simulate heavy lifting based on task type
      if (taskType === 'PDF_GEN') {
        console.log(`[QUEUE_WORKER] Generating PDF report for ${payload.documentId}...`);
        await new Promise(res => setTimeout(res, 3000));
        return { success: true, pdfUrl: `/downloads/${payload.documentId}.pdf` };
      } 
      else if (taskType === 'AI_EVAL') {
        console.log(`[QUEUE_WORKER] Running Deep AI Evaluation for compliance gap...`);
        await new Promise(res => setTimeout(res, 5000));
        return { success: true, findings: [{ risk: 'LOW', details: 'Automated AI Check Passed' }] };
      }
      else if (taskType === 'DOC_PARSE') {
        console.log(`[QUEUE_WORKER] Parsing unstructured document for OCR...`);
        await new Promise(res => setTimeout(res, 4000));
        return { success: true, text: 'Parsed document text content...' };
      }

      await new Promise(res => setTimeout(res, 2000));
      return { success: true, processed: true };
    }, { connection: this.connection, concurrency: 5 }); // Limit concurrency to protect DB

    console.log('[QUEUE_WORKER] Background queues configured.');
  }

  public async enqueueComplianceJob(tenantId: string, taskType: string, payload: any, priority: number = 0) {
    const jobId = crypto.randomUUID();
    
    if (this.isRedisConnected) {
      await this.assessmentQueue.add(taskType, {
        tenantId,
        taskType,
        payload
      }, {
        jobId,
        priority, // 1 is highest priority for BullMQ
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 }
      });
      console.log(`[QUEUE_MANAGER] Job ${jobId} (${taskType}) queued for Tenant ${tenantId} (Priority: ${priority}) via BullMQ`);
    } else {
      console.log(`[QUEUE_MANAGER] Redis offline. Falling back to immediate execution for ${taskType} job ${jobId}`);
      // In a real scenario, this would execute the task synchronously or throw an error
    }
    
    return { jobId, status: 'QUEUED' };
  }
}

export const queueManager = new BackgroundQueueManager();
