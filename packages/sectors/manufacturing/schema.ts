export const schema = {
  tables: [
    {
      name: 'machine_safety_certs',
      columns: [
        { name: 'cert_id', type: 'uuid', primary: true,  },
        { name: 'machine_id', type: 'string',  required: true, },
        { name: 'ce_marking', type: 'boolean',   },
        { name: 'risk_assessment_done', type: 'boolean',   },
        { name: 'guards_test_pass', type: 'boolean',   },
        { name: 'last_certification', type: 'timestamp',   }
      ]
    },
    {
      name: 'supplier_due_diligence',
      columns: [
        { name: 'diligence_id', type: 'uuid', primary: true,  },
        { name: 'supplier_id', type: 'string',  required: true, },
        { name: 'lsg_risk_level', type: 'string',   },
        { name: 'child_labor_redflag', type: 'boolean',   },
        { name: 'audit_completed', type: 'boolean',   },
        { name: 'remediation_plan', type: 'text',   }
      ]
    }
  ]
};
