import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { schema } from './schema';

export const Pack: SectorPack = {
  id: 'pack-aviation',
  name: 'Aviation & Aerospace',
  description: 'ICAO/EASA safety, pilot data, dual-use export, passenger PNR (API/PNR)',
  modules: [
    {
      id: 'easa-safety',
      name: 'EASA Mandatory Occurrence Reporting',
      type: 'backend_service'
    },
    {
      id: 'eu-pnr',
      name: 'EU PNR Directive Compliance',
      type: 'backend_service'
    }
  ],
  schema,
  registerRoutes
};
