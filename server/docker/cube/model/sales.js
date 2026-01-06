cube(`Sales`, {
  sql: `
    SELECT
      oi.order_item_id,
      o.order_date,
      c.customer_id,
      c.name AS customer_name,
      c.country,
      p.category,
      oi.quantity,
      p.price,
      (oi.quantity * p.price) AS revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    JOIN customers c ON o.customer_id = c.customer_id
    JOIN products p ON oi.product_id = p.product_id
  `,

  measures: {
    totalRevenue: {
      sql: `revenue`,
      type: `sum`
    },

    totalQuantity: {
      sql: `quantity`,
      type: `sum`
    },

    orderCount: {
      sql: `order_item_id`,
      type: `count`
    }
  },

  dimensions: {
    orderDate: {
      sql: `order_date`,
      type: `time`
    },

    category: {
      sql: `category`,
      type: `string`
    },

    country: {
      sql: `country`,
      type: `string`
    },

    customerName: {
      sql: `customer_name`,
      type: `string`
    }
  }
});
