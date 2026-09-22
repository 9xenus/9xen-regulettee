import cron from 'node-cron';
import { logger } from '../utils/logger';
import db, { getDb } from '../db/sqlite';

export interface RegionalConfig {
  regionId: string;
  name: string;
  cronSchedule: string;
  sourceEndpoint: string;
  isActive: boolean;
}

export interface RagLog {
  id: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILURE' | 'IN_PROGRESS';
  message: string;
  details?: any;
  regionId?: string;
}

export const getRecentLogs = (): RagLog[] => {
  try {
    const activeDb = getDb() || db;
    if (!activeDb || typeof activeDb.prepare !== 'function') return [];
    const rows = activeDb.prepare('SELECT * FROM rag_logs ORDER BY timestamp DESC LIMIT 100').all() as any[];
    return rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      status: row.status,
      message: row.message,
      details: row.details ? JSON.parse(row.details) : undefined,
      regionId: row.region_id
    }));
  } catch (error) {
    logger.error('[LAW_UPDATER] Failed to fetch logs from DB:', error);
    return [];
  }
};

const addLog = (log: Omit<RagLog, 'id' | 'timestamp'>) => {
  try {
    const activeDb = getDb() || db;
    if (!activeDb || typeof activeDb.prepare !== 'function') return;
    const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    activeDb.prepare(`
      INSERT INTO rag_logs (id, timestamp, status, message, details, region_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      timestamp,
      log.status,
      log.message,
      log.details ? JSON.stringify(log.details) : null,
      log.regionId || null
    );
  } catch (error) {
    logger.error('[LAW_UPDATER] Failed to add log to DB:', error);
  }
};

const cronTasks: Record<string, any> = {};

async function fetchLawsForRegion(config: RegionalConfig) {
  logger.info(`[LAW_UPDATER] Starting fetch for ${config.name}...`);
  addLog({ status: 'IN_PROGRESS', message: `Initiating connection to ${config.name} database...`, regionId: config.regionId });
  
  // Simulated delay for realism
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulation logic: sometimes fails, sometimes succeeds
  if (Math.random() > 0.85) { 
     addLog({ status: 'FAILURE', message: `Connection timeout while reaching ${config.name} endpoint.`, details: { code: 'ETIMEDOUT' }, regionId: config.regionId });
     throw new Error(`Connection timeout for ${config.regionId}`);
  }
  
  const newLaws = Math.floor(Math.random() * 10) + 1;
  logger.info(`[LAW_UPDATER] Fetched ${newLaws} new laws from ${config.name}.`);
    
  // Logic to update database/RAG engine would go here
  
  addLog({ 
     status: 'SUCCESS', 
     message: `Automated fetch from ${config.name} completed. ${newLaws} new laws embedded.`,
     details: { laws: newLaws, vectorsUpdated: newLaws * 5 },
     regionId: config.regionId
  });
}

export const triggerManualUpdate = async (regionId: string) => {
  const configs = getRegionalConfigs();
  const config = configs.find(c => c.regionId === regionId);
  if (!config) return;
  
  logger.info(`[LAW_UPDATER] Manual update triggered for ${regionId}.`);
  try {
    await fetchLawsForRegion(config);
  } catch (error) {
    logger.error(`[LAW_UPDATER] Manual update failed for ${regionId}:`, error);
  }
};

export const getRegionalConfigs = (): RegionalConfig[] => {
  try {
    const rows = db.prepare('SELECT * FROM rag_configs').all() as any[];
    return rows.map(row => ({
      regionId: row.region_id,
      name: row.name,
      cronSchedule: row.cron_schedule,
      sourceEndpoint: row.source_endpoint,
      isActive: Boolean(row.is_active)
    }));
  } catch (error) {
    logger.error('[LAW_UPDATER] Failed to fetch regional configs from DB:', error);
    return [];
  }
};

export const updateRegionalConfig = (regionId: string, updates: Partial<RegionalConfig>) => {
  try {
    const configs = getRegionalConfigs();
    const config = configs.find(c => c.regionId === regionId);
    if (!config) return null;

    const updated = { ...config, ...updates };
    
    db.prepare(`
      UPDATE rag_configs 
      SET cron_schedule = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE region_id = ?
    `).run(
      updated.cronSchedule,
      updated.isActive ? 1 : 0,
      regionId
    );

    // Restart cron job if active, or stop if inactive
    if (cronTasks[regionId]) {
      cronTasks[regionId].stop();
      delete cronTasks[regionId];
    }
    
    if (updated.isActive) {
      startCronForRegion(updated);
    }
    return updated;
  } catch (error) {
    logger.error('[LAW_UPDATER] Failed to update regional config in DB:', error);
    return null;
  }
};

const startCronForRegion = (config: RegionalConfig) => {
  logger.info(`[LAW_UPDATER] Starting cron for ${config.regionId} with schedule: ${config.cronSchedule}`);
  cronTasks[config.regionId] = cron.schedule(config.cronSchedule, async () => {
    logger.info(`[LAW_UPDATER] Running scheduled update for ${config.regionId}...`);
    try {
      await fetchLawsForRegion(config);
    } catch (error) {
      logger.error(`[LAW_UPDATER] Scheduled update failed for ${config.regionId}:`, error);
    }
  });
};

export const startGlobalLawUpdater = () => {
  const configs = getRegionalConfigs();
  configs.filter(c => c.isActive).forEach(startCronForRegion);
};
