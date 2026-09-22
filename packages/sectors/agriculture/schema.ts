export const schema = {
  tables: [
    {
      name: 'food_batch_traceability',
      columns: [
        { name: 'batch_id', type: 'uuid', primary: true,  },
        { name: 'lot_code', type: 'string',  required: true, },
        { name: 'origin_farm', type: 'string',   },
        { name: 'traceable_to_batch', type: 'boolean',   },
        { name: 'recall_wired', type: 'boolean',   },
        { name: 'pesticide_mrl_pass', type: 'boolean',   }
      ]
    },
    {
      name: 'agrochemical_usage',
      columns: [
        { name: 'usage_id', type: 'uuid', primary: true,  },
        { name: 'crop_id', type: 'string',  required: true, },
        { name: 'pesticide_code', type: 'string',   },
        { name: 'mrl_tested', type: 'boolean',   },
        { name: 'application_window_ok', type: 'boolean',   },
        { name: 'grower_audit', type: 'timestamp',   }
      ]
    }
  ]
};
