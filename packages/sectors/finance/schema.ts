export const financeSchema = {
  tables: [
    {
      name: 'loan_applications',
      columns: [
        { name: 'id', type: 'uuid', primary: true },
        { name: 'applicant_id', type: 'string', required: true },
        { name: 'principal_amount', type: 'decimal', required: true },
        { name: 'annual_income_declared', type: 'decimal' },
        { name: 'debt_to_income_ratio', type: 'float' },
        { name: 'aml_risk_score', type: 'integer' },
        { name: 'lending_decision', type: 'string' },
        { name: 'flags', type: 'jsonb' },
        { name: 'created_at', type: 'timestamp' }
      ]
    },
    {
      name: 'insurance_policies',
      columns: [
        { name: 'id', type: 'uuid', primary: true },
        { name: 'policy_holder_id', type: 'string', required: true },
        { name: 'product_line', type: 'string' },
        { name: 'premium', type: 'decimal' },
        { name: 'compliance_checksum', type: 'string' },
        { name: 'regulatory_region', type: 'string' },
        { name: 'approval_status', type: 'string' }
      ]
    }
  ]
};