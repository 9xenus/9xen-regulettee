export const govtSchema = {
  tables: [
    {
      name: 'procurement_tenders',
      columns: [
        { name: 'id', type: 'uuid', primary: true },
        { name: 'department_id', type: 'string', required: true },
        { name: 'tender_value', type: 'decimal', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'risk_score', type: 'integer' },
        { name: 'anomalies', type: 'jsonb' },
        { name: 'created_at', type: 'timestamp' }
      ]
    },
    {
      name: 'tax_filings',
      columns: [
        { name: 'id', type: 'uuid', primary: true },
        { name: 'entity_id', type: 'string', required: true },
        { name: 'declared_revenue', type: 'decimal' },
        { name: 'estimated_revenue_ai', type: 'decimal' },
        { name: 'evasion_probability', type: 'float' },
        { name: 'flags', type: 'jsonb' }
      ]
    },
    {
      name: 'citizen_grievances',
      columns: [
        { name: 'id', type: 'uuid', primary: true },
        { name: 'category', type: 'string' },
        { name: 'nlp_sentiment', type: 'float' },
        { name: 'raw_text', type: 'text' },
        { name: 'assigned_agency', type: 'string' },
        { name: 'resolution_status', type: 'string' }
      ]
    }
  ]
};
