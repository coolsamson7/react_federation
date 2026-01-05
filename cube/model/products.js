cube(`Products`, {
  sql: `SELECT * FROM public.products`,

  measures: {
    count: {
      type: `count`,
      drillMembers: [productId, name, category]
    },

    price: {
      sql: `price`,
      type: `number`
    }
  },

  dimensions: {
    productId: {
      sql: `product_id`,
      type: `number`,
      primaryKey: true
    },

    name: {
      sql: `name`,
      type: `string`
    },

    category: {
      sql: `category`,
      type: `string`
    }
  }
});
