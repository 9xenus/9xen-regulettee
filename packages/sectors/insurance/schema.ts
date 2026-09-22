export const schema = {
  tables: [
    {
      name: 'policy_holder_protections',
      columns: [
        { name: 'policy_id', type: 'uuid', primary: true,  },
        { name: 'holder_id', type: 'string',  required: true, },
        { name: 'product_line', type: 'string',   },
        { name: 'suitability_score', type: 'float',   },
        { name: 'disclosure_signed', type: 'boolean',   },
        { name: 'region', type: 'string',   }
      ]
    },
    {
      name: 'solvency_capital_entries',
      columns: [
        { name: 'entry_id', type: 'uuid', primary: true,  },
        { name: 'reporting_period', type: 'string',  required: true, },
        { name: 'scr_ratio', type: 'float',   },
        { name: 'mcr_ratio', type: 'float',   },
        { name: 'capital_adequacy', type: 'string',   },
        { name: 'regulator_signoff', type: 'string',   }
      ]
    }
  ]
};
