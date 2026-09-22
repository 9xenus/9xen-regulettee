export const schema = {
  tables: [
    {
      name: 'aerospace_safety_events',
      columns: [
        { name: 'event_id', type: 'uuid', primary: true,  },
        { name: 'aircraft_reg', type: 'string',  required: true, },
        { name: 'easa_event_class', type: 'string',   },
        { name: 'mandatory_reported', type: 'boolean',   },
        { name: 'moc_applied', type: 'boolean',   },
        { name: 'reported_at', type: 'timestamp',   }
      ]
    },
    {
      name: 'pnr_passenger_data',
      columns: [
        { name: 'pnr_id', type: 'uuid', primary: true,  },
        { name: 'booking_ref', type: 'string',  required: true, },
        { name: 'eu_pnr_dir_compliant', type: 'boolean',   },
        { name: 'six_month_retention', type: 'boolean',   },
        { name: 'pii_hashed', type: 'boolean',   },
        { name: 'carrier_notified', type: 'boolean',   }
      ]
    }
  ]
};
