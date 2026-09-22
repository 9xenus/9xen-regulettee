import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { schema } from './schema';

export const Pack: SectorPack = {
  id: 'pack-medical-devices',
  name: 'Medical Devices & IVD',
  description: 'EU MDR/IVDR post-market vigilance (PSUR/PMS), CE marking conformity, adverse incident reporting',
  framework: 'EU MDR 2017/745 / IVDR 2017/746 / ISO 13485 / FDA 21 CFR 820',
  modules: [
    {
      id: 'vigilance-reporting',
      name: 'Post-Market Vigilance & PSUR',
      type: 'backend_service'
    },
    {
      id: 'ivd-performance',
      name: 'IVD Performance & Analytical Validity',
      type: 'backend_service'
    }
  ],
  schema,
  registerRoutes
};