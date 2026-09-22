import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { schema } from './schema';

export const Pack: SectorPack = {
  id: 'pack-food',
  name: 'Food & Beverage Safety',
  description: 'HACCP / FSMA traceability, allergen labelling, cold-chain logging, 178/2002 recall readiness',
  framework: 'EC 178/2002 / FSMA / HACCP / EU 1169/2011 labelling',
  modules: [
    {
      id: 'food-traceability',
      name: 'Farm-to-Fork Traceability',
      type: 'backend_service'
    },
    {
      id: 'allergen-label-auditor',
      name: 'Allergen & Label Auditor',
      type: 'backend_service'
    }
  ],
  schema,
  registerRoutes
};