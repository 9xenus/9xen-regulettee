import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { schema } from './schema';

export const Pack: SectorPack = {
  id: 'pack-pharma',
  name: 'Pharmaceuticals & Clinical',
  description: 'GxP, clinical trial integrity, pharmacovigilance reporting, GDP cold chain',
  modules: [
    {
      id: 'gcp-trials',
      name: 'ICH GCP Clinical Trial Integrity',
      type: 'backend_service'
    },
    {
      id: 'pharmacovigilance',
      name: 'EU Pharmacovigilance Reporting',
      type: 'backend_service'
    }
  ],
  schema,
  registerRoutes
};
