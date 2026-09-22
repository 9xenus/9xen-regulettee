export const schema = {
  tables: [
    {
      name: 'vehicle_cyber_certifications',
      columns: [
        { name: 'cert_id', type: 'uuid', primary: true },
        { name: 'model_line', type: 'string', required: true },
        { name: 'csms_status', type: 'string' },
        { name: 'r155_approval', type: 'string' },
        { name: 'r156_sotif', type: 'string' },
        { name: 'ot_calendar', type: 'jsonb' },
        { name: 'assessed_at', type: 'timestamp' }
      ]
    },
    {
      name: 'telematics_data_contracts',
      columns: [
        { name: 'contract_id', type: 'uuid', primary: true },
        { name: 'mobility_platform', type: 'string', required: true },
        { name: 'data_categories', type: 'jsonb' },
        { name: 'legal_basis', type: 'string' },
        { name: 'dpia_status', type: 'string' },
        { name: 'reconsent_required', type: 'boolean' },
        { name: 'recorded_at', type: 'timestamp' }
      ]
    }
  ]
};