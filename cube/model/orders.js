cube(`Orders`, {
  sql: `SELECT * FROM public.orders`,

  joins: {
    Customers: {
      sql: `${CUBE}.customer_id = ${Customers}.customer_id`,
      relationship: `belongsTo`
    }
  },

  measures: {
    count: {
      type: `count`,
      drillMembers: [orderId, orderDate]
    }
  },

  dimensions: {
    orderId: {
      sql: `order_id`,
      type: `number`,
      primaryKey: true
    },

    orderDate: {
      sql: `order_date`,
      type: `time`
    }
  }
});
