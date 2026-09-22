export const schema = {
  tables: [
    {
      name: 'dangerous_goods_shipments',
      columns: [
        { name: 'dg_shipment_id', type: 'uuid', primary: true,  },
        { name: 'un_number', type: 'string',  required: true, },
        { name: 'adr_class', type: 'string',   },
        { name: 'declaration_pass', type: 'boolean',   },
        { name: 'packaging_cert', type: 'string',   },
        { name: 'route_permitted', type: 'boolean',   }
      ]
    },
    {
      name: 'driver_telemetry',
      columns: [
        { name: 'telemetry_id', type: 'uuid', primary: true,  },
        { name: 'driver_id', type: 'string',  required: true, },
        { name: 'gps_trace_logged', type: 'boolean',   },
        { name: 'privacy_notice_accepted', type: 'boolean',   },
        { name: 'retention_policy', type: 'string',   },
        { name: 'consent_refresh_due', type: 'boolean',   }
      ]
    }
  ]
};
