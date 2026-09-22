export const schema = {
  tables: [
    {
      name: 'age_verification_records',
      columns: [
        { name: 'verification_id', type: 'uuid', primary: true,  },
        { name: 'player_id', type: 'string',  required: true, },
        { name: 'id_reference', type: 'string',   },
        { name: 'age_verified', type: 'boolean',   },
        { name: 'jurisdiction_min_age', type: 'integer',   },
        { name: 'verified_at', type: 'timestamp',   }
      ]
    },
    {
      name: 'gaming_aml_signals',
      columns: [
        { name: 'signal_id', type: 'uuid', primary: true,  },
        { name: 'player_id', type: 'string',  required: true, },
        { name: 'deposit_velocity', type: 'float',   },
        { name: 'structured_deposits', type: 'boolean',   },
        { name: 'suspicious_flag', type: 'boolean',   },
        { name: 'sarl_submitted', type: 'boolean',   }
      ]
    }
  ]
};
