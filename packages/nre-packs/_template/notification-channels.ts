import { NotificationChannelsConfig } from './pack.manifest';

export const TEMPLATE_NOTIFICATION_CHANNELS: NotificationChannelsConfig = {
  email: true,
  whatsapp: true,
  wechat: false,
  smsFallback: true,
  physicalLetter: true,
  languagePriority: ['en']
};
