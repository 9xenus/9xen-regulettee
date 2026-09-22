export const schema = {
  tables: [
    {
      name: 'media_moderation_logs',
      columns: [
        { name: 'log_id', type: 'uuid', primary: true },
        { name: 'content_id', type: 'string', required: true },
        { name: 'content_type', type: 'string' },
        { name: 'decision', type: 'string' },
        { name: 'grounds_category', type: 'string' },
        { name: 'appeal_available', type: 'boolean' },
        { name: 'moderated_at', type: 'timestamp' }
      ]
    },
    {
      name: 'avms_advertising_reviews',
      columns: [
        { name: 'ad_id', type: 'uuid', primary: true },
        { name: 'advertiser', type: 'string', required: true },
        { name: 'sponsor_disclosed', type: 'boolean' },
        { name: 'product_category', type: 'string' },
        { name: 'restricted_class', type: 'string' },
        { name: 'reviewed_at', type: 'timestamp' }
      ]
    }
  ]
};