export const schema = {
  tables: [
    {
      name: 'food_batches',
      columns: [
        { name: 'batch_id', type: 'uuid', primary: true },
        { name: 'sku', type: 'string', required: true },
        { name: 'origin_supplier', type: 'string' },
        { name: 'trace_status', type: 'string' },
        { name: 'cold_chain_breaks', type: 'integer' },
        { name: 'recall_active', type: 'boolean' },
        { name: 'production_date', type: 'date' }
      ]
    },
    {
      name: 'allergen_declarations',
      columns: [
        { name: 'decl_id', type: 'uuid', primary: true },
        { name: 'product_name', type: 'string', required: true },
        { name: 'declared_allergens', type: 'jsonb' },
        { name: 'label_version', type: 'string' },
        { name: 'audited', type: 'boolean' },
        { name: 'audited_at', type: 'timestamp' }
      ]
    }
  ]
};