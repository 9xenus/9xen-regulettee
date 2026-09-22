import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { schema } from './schema';

export const Pack: SectorPack = {
  id: 'pack-mining',
  name: 'Mining & Extractives',
  description: 'GISTM tailings safety, conflict minerals (OECD/UFLPA), mine worker health & safety, ESG disclosure',
  framework: 'GISTM / OECD Due Diligence / EU Conflict Minerals Reg 2017/821 / IFC EHS',
  modules: [
    {
      id: 'tailings-safety',
      name: 'GISTM Tailings Facility Safety',
      type: 'backend_service'
    },
    {
      id: 'conflict-minerals',
      name: 'Conflict Minerals Traceability',
      type: 'backend_service'
    }
  ],
  schema,
  registerRoutes
};