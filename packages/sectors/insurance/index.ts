import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { schema } from './schema';

export const Pack: SectorPack = {
  id: 'pack-insurance',
  name: 'Insurance & Actuarial',
  description: 'Solvency II, policyholder protection, IFRS17 disclosures, claims integrity',
  modules: [
    {
      id: 'solvency-ii-capital',
      name: 'Solvency II Capital Monitor',
      type: 'backend_service'
    },
    {
      id: 'policyholder-protection',
      name: 'Policyholder Suitability Engine',
      type: 'backend_service'
    }
  ],
  schema,
  registerRoutes
};
