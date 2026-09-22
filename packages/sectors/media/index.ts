import { SectorPack } from '../../core/src/types';
import { registerRoutes } from './routes';
import { schema } from './schema';

export const Pack: SectorPack = {
  id: 'pack-media',
  name: 'Media, Streaming & Digital Services',
  description: 'DSA transparency, AVMS advertising/sponsorship rules, content moderation due diligence',
  framework: 'DSA 2022/2065 / AVMS 2018/1808 / GDPR media',
  modules: [
    {
      id: 'dsa-transparency',
      name: 'DSA Systemic Transparency',
      type: 'backend_service'
    },
    {
      id: 'avms-ads-gate',
      name: 'AVMS Advertising Gate',
      type: 'backend_service'
    }
  ],
  schema,
  registerRoutes
};