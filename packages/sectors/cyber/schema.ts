export const schema = {
  tables: [
    {
      name: 'cyber_occurrences',
      columns: [
        { name: 'occurrence_id', type: 'uuid', primary: true },
        { name: 'tenant_id', type: 'string', required: true },
        { name: 'severity_rating', type: 'string' },
        { name: 'incident_type', type: 'string' },
        { name: 'entities_impacted', type: 'integer' },
        { name: 'notification_deadline', type: 'timestamp' },
        { name: 'notified_csirt', type: 'boolean' },
        { name: 'occurred_at', type: 'timestamp' }
      ]
    },
    {
      name: 'dora_ict_risk_register',
      columns: [
        { name: 'risk_id', type: 'uuid', primary: true },
        { name: 'third_party_name', type: 'string', required: true },
        { name: 'cloud_concentration_pct', type: 'decimal' },
        { name: 'critical_service', type: 'boolean' },
        { name: 'exit_plan_file', type: 'string' },
        { name: 'assessed_at', type: 'timestamp' }
      ]
    }
  ]
};