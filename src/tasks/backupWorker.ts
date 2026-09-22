import { BackupService } from '../services/backup-service';
import { logger } from '../utils/logger';
import { runExclusiveJob } from './jobCoordinator';

let isRunning = false;

/**
 * Starts the background worker for automated backups.
 * Wrapped in a Redis-alternative exclusive-job lease so a high-stakes backup is
 * never executed concurrently (across overlaps or duplicated daemons), and a
 * recent completion (within 5 minutes) is not repeated.
 */
export const startBackupWorker = () => {
  logger.info('[BACKUP_WORKER] Initializing disaster recovery background process...');
  
  // Check every 5 minutes
  setInterval(async () => {
    if (isRunning) return;
    
    try {
      const config = BackupService.getConfig();
      
      if (!config.is_active) {
        return;
      }

      const now = new Date();
      const nextRun = new Date(config.next_run);

      if (now >= nextRun) {
        isRunning = true;
        logger.info('[BACKUP_WORKER] Triggering scheduled encrypted backup...');
        
        try {
          const outcome = await runExclusiveJob(
            { jobKey: 'job:backup:automated', ttlMs: 300000, heartbeatIntervalMs: 60000, dedupeWindowMs: 300000, tag: 'automated-encrypted-backup' },
            async () => {
              const backupId = await BackupService.performBackup(true);
              logger.info(`[BACKUP_WORKER] Automated backup successful: ${backupId}`);
              return { backupId };
            }
          );
          if (outcome.status === 'skipped') {
            logger.info('[BACKUP_WORKER] Backup already running or recently completed — skipping this cycle.');
          }
        } catch (err: any) {
          logger.error(`[BACKUP_WORKER] Automated backup failed: ${err.message}`);
        } finally {
          isRunning = false;
        }
      }
    } catch (err: any) {
      logger.error(`[BACKUP_WORKER] Error in backup worker interval: ${err.message}`);
    }
  }, 300000); // 5 minutes
};
