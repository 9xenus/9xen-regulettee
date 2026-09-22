import { Region, RegionalConfig } from './types';

const store: Record<Region, RegionalConfig> = {
  'EU': { region: 'EU', active: true, lastUpdated: '2026-07-14' },
  'USA': { region: 'USA', active: false, lastUpdated: '2026-06-01' },
  'AUSTRALIA': { region: 'AUSTRALIA', active: true, lastUpdated: '2026-07-12' },
  'NEW_ZEALAND': { region: 'NEW_ZEALAND', active: true, lastUpdated: '2026-07-01' },
  'APAC': { region: 'APAC', active: false, lastUpdated: '2026-05-15' },
};

export const getCoverageConfigs = (): RegionalConfig[] => Object.values(store);

export const toggleRegionActive = (region: Region) => {
  if (store[region]) {
    store[region].active = !store[region].active;
    store[region].lastUpdated = new Date().toISOString().split('T')[0];
  }
};

export const bulkToggleRegions = (regions: Region[], active: boolean) => {
  regions.forEach(region => {
    if (store[region]) {
      store[region].active = active;
      store[region].lastUpdated = new Date().toISOString().split('T')[0];
    }
  });
};
