export const schema = {
  tables: [
    {
      name: 'clinical_trials',
      columns: [
        { name: 'trial_id', type: 'uuid', primary: true,  },
        { name: 'eudract_ref', type: 'string',  required: true, },
        { name: 'gcp_audit_pass', type: 'boolean',   },
        { name: 'informed_consent_complete', type: 'boolean',   },
        { name: 'data_fabricated', type: 'boolean',   },
        { name: 'phase', type: 'string',   }
      ]
    },
    {
      name: 'pharmacovigilance_reports',
      columns: [
        { name: 'pv_id', type: 'uuid', primary: true,  },
        { name: 'serious_adr', type: 'boolean',  required: true, },
        { name: 'eu_report_deadline_hours', type: 'integer',   },
        { name: 'submitted_on_time', type: 'boolean',   },
        { name: 'ema_booked', type: 'boolean',   },
        { name: 'created_at', type: 'timestamp',   }
      ]
    }
  ]
};
