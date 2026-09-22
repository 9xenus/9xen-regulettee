import { Region, PolicyAct } from './types';

const store: Record<Region, PolicyAct[]> = {
  'EU': [{ id: 'eu-ai', name: 'EU AI Act', version: '1.0.5', region: 'EU', status: 'Up-to-date', lastSynced: '2026-07-10', enabled: true, impactScore: 85 }],
  'USA': [{ id: 'usa-privacy', name: 'US Privacy Framework', version: '2.0.0', region: 'USA', status: 'Update Available', lastSynced: '2026-06-01', enabled: false, impactScore: 90 }],
  'AUSTRALIA': [{ id: 'au-privacy', name: 'AU Privacy Act', version: '1.1.0', region: 'AUSTRALIA', status: 'Up-to-date', lastSynced: '2026-07-12', enabled: true, impactScore: 70 }],
  'NEW_ZEALAND': [{ id: 'nz-privacy', name: 'NZ Privacy Act', version: '1.0.0', region: 'NEW_ZEALAND', status: 'Up-to-date', lastSynced: '2026-07-01', enabled: true, impactScore: 65 }],
  'APAC': [{ id: 'apac-data', name: 'APAC Data Shield', version: '3.1.2', region: 'APAC', status: 'Update Available', lastSynced: '2026-05-15', enabled: false, impactScore: 80 }],
};

export const getActsByRegion = (region: Region): PolicyAct[] => store[region] || [];

export const updateActStatus = (region: Region, actId: string, updates: Partial<PolicyAct>) => {
  if (store[region]) {
    store[region] = store[region].map(act => act.id === actId ? { ...act, ...updates } : act);
  }
};

export const bulkUpdateActs = (region: Region, actIds: string[], enabled: boolean) => {
  if (store[region]) {
    store[region] = store[region].map(act => actIds.includes(act.id) ? { ...act, enabled } : act);
  }
};
