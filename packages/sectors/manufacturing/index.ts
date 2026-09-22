import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { schema } from './schema';

export const Pack: SectorPack = {
  id: 'pack-manufacturing',
  name: 'Manufacturing & Industry 4.0',
  description: 'Product liability, supply chain (LkSG), machine safety, export controls',
  modules: [
    {
      id: 'machine-safety-ce',
      name: 'Machinery Safety & CE Marking',
      type: 'backend_service'
    },
    {
      id: 'lsg-supply-chain',
      name: 'LkSG Supply Chain Due Diligence',
      type: 'backend_service'
    }
  ],
  schema,
  registerRoutes
};
