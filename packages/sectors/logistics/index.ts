import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { schema } from './schema';

export const Pack: SectorPack = {
  id: 'pack-logistics',
  name: 'Logistics & Freight Forwarding',
  description: 'Cargo security (AEO/CTPAT), IMDG/ADR freight hazard, customs valuation, shipment data privacy',
  framework: 'AEO / CTPAT / IMDG / EU Customs Code / GDPR logistics',
  modules: [
    {
      id: 'cargo-security-gate',
      name: 'Cargo Security & AEO Gate',
      type: 'backend_service'
    },
    {
      id: 'hazmat-freight',
      name: 'Hazmat Freight Guardrail',
      type: 'backend_service'
    }
  ],
  schema,
  registerRoutes
};