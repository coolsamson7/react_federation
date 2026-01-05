cube(`OrderItems`, {
  sql: `SELECT * FROM public.order_items`,

  joins: {
    Orders: {
      sql: `${CUBE}.order_id = ${Orders}.order_id`,
      relationship: `belongsTo`
    },

    Products: {
      sql: `${CUBE}.product_id = ${Products}.product_id`,
      relationship: `belongsTo`
    }
  },

  measures: {
    quantity: {
      sql: `quantity`,
      type: `sum`
    },
  },

  dimensions: {
    orderItemId: {
      sql: `order_item_id`,
      type: `number`,
      primaryKey: true
    }
  }
});
