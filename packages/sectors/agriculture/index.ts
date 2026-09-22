import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { schema } from './schema';

export const Pack: SectorPack = {
  id: 'pack-agriculture',
  name: 'Agriculture & Food Safety',
  description: 'Food traceability, pesticide tolerance, bio-security, fair-trade sourcing',
  modules: [
    {
      id: 'food-traceability',
      name: 'Food Batch Traceability',
      type: 'backend_service'
    },
    {
      id: 'agrochemical-mrl',
      name: 'Pesticide MRL Compliance',
      type: 'backend_service'
    }
  ],
  schema,
  registerRoutes
};
