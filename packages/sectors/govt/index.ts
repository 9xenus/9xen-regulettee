import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { govtSchema } from './schema';

export const GovtSectorPack: SectorPack = {
  id: 'pack-007-govt',
  name: 'Government & Public Sector (GovTech)',
  description: 'Tax Anomaly Detection, E-Procurement Audit, Citizen Grievance NLP',
  modules: [
    {
      id: 'tax-anomaly-engine',
      name: 'Tax Evasion Intelligence',
      type: 'backend_service'
    },
    {
      id: 'eprocurement-audit',
      name: 'E-Procurement Fraud Detection',
      type: 'backend_service'
    }
  ],
  schema: govtSchema,
  registerRoutes
};
