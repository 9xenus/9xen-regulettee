export const schema = {
  tables: [
    {
      name: 'patient_health_records',
      columns: [
        { name: 'record_id', type: 'uuid', primary: true,  },
        { name: 'patient_id', type: 'string',  required: true, },
        { name: 'data_category', type: 'string',  required: true, },
        { name: 'is_sensitive', type: 'boolean',   },
        { name: 'consent_ref', type: 'string',   },
        { name: 'deident_score', type: 'float',   },
        { name: 'created_at', type: 'timestamp',   }
      ]
    },
    {
      name: 'medical_device_filings',
      columns: [
        { name: 'filing_id', type: 'uuid', primary: true,  },
        { name: 'device_class', type: 'string',  required: true, },
        { name: 'regulatory_body', type: 'string',   },
        { name: 'risk_category', type: 'string',   },
        { name: 'approval_status', type: 'string',   },
        { name: 'post_market_findings', type: 'jsonb',   }
      ]
    }
  ]
};
