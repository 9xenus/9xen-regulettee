import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { schema } from './schema';

export const Pack: SectorPack = {
  id: 'pack-gaming',
  name: 'Gaming & Gambling',
  description: 'Licence compliance, age verification, AML betting, responsible gaming',
  modules: [
    {
      id: 'age-verification',
      name: 'Regulated Age Verification',
      type: 'backend_service'
    },
    {
      id: 'gaming-aml',
      name: 'Gaming AML & SAR Automation',
      type: 'backend_service'
    }
  ],
  schema,
  registerRoutes
};
