export const schema = {
  tables: [
    {
      name: 'property_transactions',
      columns: [
        { name: 'sale_id', type: 'uuid', primary: true,  },
        { name: 'property_ref', type: 'string',  required: true, },
        { name: 'buyer_sanctions_flag', type: 'boolean',   },
        { name: 'source_of_funds', type: 'string',   },
        { name: 'aml_due_diligence', type: 'string',   },
        { name: 'notary_cleared', type: 'boolean',   }
      ]
    },
    {
      name: 'tenant_data_inventory',
      columns: [
        { name: 'tenant_id', type: 'uuid', primary: true,  },
        { name: 'property_ref', type: 'string',  required: true, },
        { name: 'data_minimised', type: 'boolean',   },
        { name: 'consent_recorded', type: 'boolean',   },
        { name: 'rental_record_retention', type: 'string',   },
        { name: 'dsar_ready', type: 'boolean',   }
      ]
    }
  ]
};
