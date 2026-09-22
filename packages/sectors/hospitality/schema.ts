export const schema = {
  tables: [
    {
      name: 'guest_data_profiles',
      columns: [
        { name: 'guest_id', type: 'uuid', primary: true,  },
        { name: 'booking_ref', type: 'string',  required: true, },
        { name: 'data_categories', type: 'jsonb',   },
        { name: 'marketing_optin', type: 'boolean',   },
        { name: 'anonymized_after_stay', type: 'boolean',   },
        { name: 'retention_days', type: 'integer',   }
      ]
    },
    {
      name: 'guest_transfer_records',
      columns: [
        { name: 'transfer_id', type: 'uuid', primary: true,  },
        { name: 'guest_id', type: 'string',  required: true, },
        { name: 'tpc_scrutinised', type: 'boolean',   },
        { name: 'destination_adequacy', type: 'string',   },
        { name: 'sccs_signed', type: 'boolean',   },
        { name: 'logged_at', type: 'timestamp',   }
      ]
    }
  ]
};
