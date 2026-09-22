export const schema = {
  tables: [
    {
      name: 'export_declarations',
      columns: [
        { name: 'declaration_id', type: 'uuid', primary: true },
        { name: 'consignee_legal_entity', type: 'string', required: true },
        { name: 'tariff_code', type: 'string' },
        { name: 'licence_ref', type: 'string' },
        { name: 'classification', type: 'string' },
        { name: 'value_usd', type: 'decimal' },
        { name: 'sanctions_flagged', type: 'boolean' },
        { name: 'declared_at', type: 'timestamp' }
      ]
    },
    {
      name: 'denied_party_hits',
      columns: [
        { name: 'hit_id', type: 'uuid', primary: true },
        { name: 'entity_name', type: 'string', required: true },
        { name: 'list_source', type: 'string', required: true },
        { name: 'match_score', type: 'float' },
        { name: 'action_taken', type: 'string' },
        { name: 'resolved', type: 'boolean' },
        { name: 'screened_at', type: 'timestamp' }
      ]
    }
  ]
};