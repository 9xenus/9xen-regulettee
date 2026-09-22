import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { financeSchema } from './schema';

export const FinanceSectorPack: SectorPack = {
  id: 'pack-008-finance',
  name: 'Finance & Capital Markets (FinTech)',
  description: 'AML Transaction Screening, KYC Risk Scoring, Insurance Product Compliance',
  modules: [
    {
      id: 'credit-risk-screener',
      name: 'Credit & Lending Risk Screener',
      type: 'backend_service'
    },
    {
      id: 'insurance-compliance',
      name: 'Insurance Product Compliance',
      type: 'backend_service'
    }
  ],
  schema: financeSchema,
  registerRoutes
};