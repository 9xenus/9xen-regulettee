import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { schema } from './schema';

export const Pack: SectorPack = {
  id: 'pack-education',
  name: 'Education & EdTech',
  description: 'Minors data (GDPR Art.8), student records, parental consent, EdTech privacy',
  modules: [
    {
      id: 'minors-consent',
      name: 'Minors Consent & Parental Gate',
      type: 'backend_service'
    },
    {
      id: 'edtech-dpa-audit',
      name: 'EdTech Vendor DPA Audit',
      type: 'backend_service'
    }
  ],
  schema,
  registerRoutes
};
