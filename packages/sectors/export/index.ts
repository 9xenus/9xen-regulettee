import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { schema } from './schema';

export const Pack: SectorPack = {
  id: 'pack-export',
  name: 'Export & Trade Compliance',
  description: 'Sanctions screening, export licence validation (EAR/ITAR), customs declarations, anti-bribery',
  framework: 'EAR / ITAR / OFAC / EU Dual-Use Reg 2021/821 / FCPA',
  modules: [
    {
      id: 'export-sanctions-screener',
      name: 'Sanctions & Denied-Party Screener',
      type: 'backend_service'
    },
    {
      id: 'export-licence-gate',
      name: 'Export Licence Validity Gate',
      type: 'backend_service'
    }
  ],
  schema,
  registerRoutes
};