import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { schema } from './schema';

export const Pack: SectorPack = {
  id: 'pack-telecom',
  name: 'Telecom & Media',
  description: 'ePrivacy, data retention, metadata handling, emergency call compliance',
  modules: [
    {
      id: 'eprivacy-metadata',
      name: 'ePrivacy Metadata Retention Compliance',
      type: 'backend_service'
    },
    {
      id: 'emergency-routing',
      name: 'Emergency Call PSAP Routing Auditor',
      type: 'backend_service'
    }
  ],
  schema,
  registerRoutes
};
