export const schema = {
  tables: [
    {
      name: 'esg_emissions_reports',
      columns: [
        { name: 'report_id', type: 'uuid', primary: true,  },
        { name: 'entity_id', type: 'string',  required: true, },
        { name: 'scope1_tco2e', type: 'decimal',   },
        { name: 'scope2_tco2e', type: 'decimal',   },
        { name: 'scope3_tco2e', type: 'decimal',   },
        { name: 'esrs_asserted', type: 'boolean',   },
        { name: 'period', type: 'string',   }
      ]
    },
    {
      name: 'critical_energy_assets',
      columns: [
        { name: 'asset_id', type: 'uuid', primary: true,  },
        { name: 'asset_class', type: 'string',  required: true, },
        { name: 'criticality', type: 'string',   },
        { name: 'nis2_obligation', type: 'string',   },
        { name: 'drill_last_passed', type: 'timestamp',   },
        { name: 'status', type: 'string',   }
      ]
    }
  ]
};
