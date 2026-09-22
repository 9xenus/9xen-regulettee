export const schema = {
  tables: [
    {
      name: 'product_safety_standees',
      columns: [
        { name: 'product_id', type: 'uuid', primary: true,  },
        { name: 'sku', type: 'string',  required: true, },
        { name: 'gpsr_risk_class', type: 'string',   },
        { name: 'recall_active', type: 'boolean',   },
        { name: 'safety_certs', type: 'jsonb',   },
        { name: 'last_audit', type: 'timestamp',   }
      ]
    },
    {
      name: 'consumer_optouts',
      columns: [
        { name: 'optout_id', type: 'uuid', primary: true,  },
        { name: 'consumer_id', type: 'string',  required: true, },
        { name: 'ccpa_request', type: 'string',   },
        { name: 'honored', type: 'boolean',   },
        { name: 'fulfill_sla_hours', type: 'integer',   },
        { name: 'logged_at', type: 'timestamp',   }
      ]
    }
  ]
};
