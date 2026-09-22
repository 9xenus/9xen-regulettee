export const schema = {
  tables: [
    {
      name: 'traffic_metadata_retention',
      columns: [
        { name: 'retention_id', type: 'uuid', primary: true,  },
        { name: 'subscriber_id', type: 'string',  required: true, },
        { name: 'retention_days', type: 'integer',   },
        { name: 'legal_basis', type: 'string',   },
        { name: 'eu_retention_cap_ok', type: 'boolean',   },
        { name: 'created_at', type: 'timestamp',   }
      ]
    },
    {
      name: 'emergency_call_logs',
      columns: [
        { name: 'log_id', type: 'uuid', primary: true,  },
        { name: 'caller_msisdn', type: 'string',  required: true, },
        { name: 'psap_routed', type: 'boolean',   },
        { name: 'location_precision', type: 'string',   },
        { name: 'handed_to_psap_sec', type: 'integer',   },
        { name: 'dispatched', type: 'string',   }
      ]
    }
  ]
};
