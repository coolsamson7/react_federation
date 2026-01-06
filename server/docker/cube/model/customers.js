cube(`Customers`, {
  sql: `SELECT * FROM public.customers`,

  measures: {
    count: {
      type: `count`,
      drillMembers: [customerId, name, country]
    }
  },

  dimensions: {
    customerId: {
      sql: `customer_id`,
      type: `number`,
      primaryKey: true
    },

    name: {
      sql: `name`,
      type: `string`
    },

    country: {
      sql: `country`,
      type: `string`
    }
  }
});
