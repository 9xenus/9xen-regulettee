import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { schema } from './schema';

export const Pack: SectorPack = {
  id: 'pack-cyber',
  name: 'Cybersecurity & NIS2',
  description: 'NIS2 incident reporting, DORA ICT risk, ransomware preparedness, security baseline attestation',
  framework: 'NIS2 2022/2555 / DORA 2022/2554 / ISO 27001',
  modules: [
    {
      id: 'nis2-incident-reporter',
      name: 'NIS2 Incident Reporting',
      type: 'backend_service'
    },
    {
      id: 'dora-ict-risk',
      name: 'DORA ICT Risk Register',
      type: 'backend_service'
    }
  ],
  schema,
  registerRoutes
};