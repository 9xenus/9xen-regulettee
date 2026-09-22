import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { schema } from './schema';

export const Pack: SectorPack = {
  id: 'pack-automotive',
  name: 'Automotive & Mobility',
  description: 'UNECE WP.29 cyber (SOD R155/R156), emissions (Euro 7), ADAS safety, telematics data privacy',
  framework: 'UNECE WP.29 R155/R156 / Euro 7 / GDPR in-vehicle / SAE J3016',
  modules: [
    {
      id: 'veh-cyber-mgmt',
      name: 'Vehicle Cyber Security Mgmt System (CSMS)',
      type: 'backend_service'
    },
    {
      id: 'telematics-privacy',
      name: 'Telematics & In-Vehicle Data Privacy',
      type: 'backend_service'
    }
  ],
  schema,
  registerRoutes
};