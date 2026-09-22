import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { schema } from './schema';

export const Pack: SectorPack = {
  id: 'pack-energy',
  name: 'Energy & Utilities',
  description: 'ESG disclosure, carbon emissions, grid safety, supplier due diligence',
  modules: [
    {
      id: 'esg-ghg-accounting',
      name: 'ESG / GHG Emissions Accounting',
      type: 'backend_service'
    },
    {
      id: 'critical-energy-resilience',
      name: 'NIS2 Critical Energy Resilience',
      type: 'backend_service'
    }
  ],
  schema,
  registerRoutes
};
