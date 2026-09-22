export const schema = {
  tables: [
    {
      name: 'cargo_security_clearances',
      columns: [
        { name: 'clearance_id', type: 'uuid', primary: true },
        { name: 'consignment_ref', type: 'string', required: true },
        { name: 'aeo_holding', type: 'string' },
        { name: 'ctpat_status', type: 'string' },
        { name: 'security_score', type: 'integer' },
        { name: 'scan_inputs', type: 'jsonb' },
        { name: 'reviewed_at', type: 'timestamp' }
      ]
    },
    {
      name: 'freight_hazmat_checks',
      columns: [
        { name: 'check_id', type: 'uuid', primary: true },
        { name: 'shipment_ref', type: 'string', required: true },
        { name: 'imdg_class', type: 'string' },
        { name: 'adr_applicable', type: 'boolean' },
        { name: 'packaging_cert', type: 'string' },
        { name: 'exemption_msds', type: 'boolean' },
        { name: 'checked_at', type: 'timestamp' }
      ]
    }
  ]
};