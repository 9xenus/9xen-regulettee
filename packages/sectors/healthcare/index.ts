import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { schema } from './schema';

export const Pack: SectorPack = {
  id: 'pack-healthcare',
  name: 'Healthcare & Life Sciences',
  description: 'HIPAA/GDPR health data, medical device regulation, patient consent, telemedicine',
  modules: [
    {
      id: 'hipaa-breaches',
      name: 'HIPAA Breach & Consent Engine',
      type: 'backend_service'
    },
    {
      id: 'medical-device-registry',
      name: 'EU MDR Device Registry',
      type: 'backend_service'
    }
  ],
  schema,
  registerRoutes
};
