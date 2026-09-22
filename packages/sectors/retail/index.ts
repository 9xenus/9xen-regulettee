import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { schema } from './schema';

export const Pack: SectorPack = {
  id: 'pack-retail',
  name: 'Retail & E-Commerce',
  description: 'Consumer rights, product safety (GPSR), CCPA opt-outs, dark patterns',
  modules: [
    {
      id: 'gpsr-product-safety',
      name: 'GPSR Product Safety Tracker',
      type: 'backend_service'
    },
    {
      id: 'ccpa-sale-optouts',
      name: 'CCPA Sale Opt-Out Fulfilment',
      type: 'backend_service'
    }
  ],
  schema,
  registerRoutes
};
