import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { schema } from './schema';

export const Pack: SectorPack = {
  id: 'pack-transportation',
  name: 'Transport & Logistics',
  description: 'Driver/employee data, dangerous goods (ADR), supply-chain security, tracking GPS',
  modules: [
    {
      id: 'adr-dangerous-goods',
      name: 'ADR Dangerous Goods Compliance',
      type: 'backend_service'
    },
    {
      id: 'driver-privacy',
      name: 'Driver Telemetry Privacy',
      type: 'backend_service'
    }
  ],
  schema,
  registerRoutes
};
