export const schema = {
  tables: [
    {
      name: 'tailings_facilities',
      columns: [
        { name: 'facility_id', type: 'uuid', primary: true },
        { name: 'facility_name', type: 'string', required: true },
        { name: 'consequence_class', type: 'string' },
        { name: 'inflow_design_met', type: 'boolean' },
        { name: 'last_engineer_review', type: 'date' },
        { name: 'remediation_open', type: 'boolean' },
        { name: 'registered_at', type: 'timestamp' }
      ]
    },
    {
      name: 'mineral_smelter_audits',
      columns: [
        { name: 'audit_id', type: 'uuid', primary: true },
        { name: 'capacity_site', type: 'string', required: true },
        { name: 'mineral_type', type: 'string' },
        { name: 'oecd_audit_status', type: 'string' },
        { name: 'conflict_region', type: 'string' },
        { name: 'grievance_open', type: 'boolean' },
        { name: 'audited_at', type: 'timestamp' }
      ]
    }
  ]
};