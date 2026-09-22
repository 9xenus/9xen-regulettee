export const schema = {
  tables: [
    {
      name: 'student_consents',
      columns: [
        { name: 'consent_id', type: 'uuid', primary: true,  },
        { name: 'student_id', type: 'string',  required: true, },
        { name: 'data_categories', type: 'jsonb',   },
        { name: 'parental_consent', type: 'boolean',   },
        { name: 'consent_age_check', type: 'integer',   },
        { name: 'expires_at', type: 'date',   }
      ]
    },
    {
      name: 'edtech_vendor_processors',
      columns: [
        { name: 'vendor_id', type: 'uuid', primary: true,  },
        { name: 'vendor_name', type: 'string',  required: true, },
        { name: 'dpa_signed', type: 'boolean',   },
        { name: 'student_data_shared', type: 'jsonb',   },
        { name: 'safeguards', type: 'string',   },
        { name: 'guaranteed_saas_uptime', type: 'boolean',   }
      ]
    }
  ]
};
