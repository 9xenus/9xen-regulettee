import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { schema } from './schema';

export const Pack: SectorPack = {
  id: 'pack-hospitality',
  name: 'Hospitality & Travel',
  description: 'Guest data privacy (GDPR), booking records, cross-border transfers, loyalty theft',
  modules: [
    {
      id: 'guest-data-privacy',
      name: 'Guest Data Privacy Lifecycle',
      type: 'backend_service'
    },
    {
      id: 'cross-border-transfers',
      name: 'Guest Data Transfer Assurance',
      type: 'backend_service'
    }
  ],
  schema,
  registerRoutes
};
