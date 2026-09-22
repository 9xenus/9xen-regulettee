import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { schema } from './schema';

export const Pack: SectorPack = {
  id: 'pack-realestate',
  name: 'Real Estate & PropTech',
  description: 'Property AML/KYC, tenant data privacy, mortgage compliance (MCD)',
  modules: [
    {
      id: 'property-aml-kyc',
      name: 'Property AML/KYC Screening',
      type: 'backend_service'
    },
    {
      id: 'tenant-data-privacy',
      name: 'Tenant Data Minimisation',
      type: 'backend_service'
    }
  ],
  schema,
  registerRoutes
};
