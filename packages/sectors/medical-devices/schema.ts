export const schema = {
  tables: [
    {
      name: 'device_vigilance_cases',
      columns: [
        { name: 'case_id', type: 'uuid', primary: true },
        { name: 'device_udi', type: 'string', required: true },
        { name: 'incident_class', type: 'string' },
        { name: 'reportability', type: 'string' },
        { name: 'report_deadline', type: 'timestamp' },
        { name: 'vigilance_notes', type: 'jsonb' },
        { name: 'recorded_at', type: 'timestamp' }
      ]
    },
    {
      name: 'ivd_certifications',
      columns: [
        { name: 'cert_id', type: 'uuid', primary: true },
        { name: 'device_slug', type: 'string', required: true },
        { name: 'risk_class', type: 'string' },
        { name: 'ce_marking', type: 'string' },
        { name: 'iso13485_audit', type: 'string' },
        { name: 'analytical_validity', type: 'jsonb' },
        { name: 'renewed_at', type: 'timestamp' }
      ]
    }
  ]
};