-- ============================================
-- DROP EXISTING TABLES (for repeatable demo)
-- ============================================
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL
);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL
);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(customer_id),
    order_date DATE NOT NULL
);

-- ============================================
-- ORDER_ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id),
    product_id INT NOT NULL REFERENCES products(product_id),
    quantity INT NOT NULL
);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Customers
INSERT INTO customers (name, country) VALUES
('Alice', 'USA'),
('Bob', 'Germany'),
('Charlie', 'France');

-- Products
INSERT INTO products (name, category, price) VALUES
('Laptop', 'Electronics', 1200.00),
('Mouse', 'Electronics', 25.50),
('Keyboard', 'Electronics', 45.00),
('Desk', 'Furniture', 300.00),
('Chair', 'Furniture', 150.00);

-- Orders
INSERT INTO orders (customer_id, order_date) VALUES
(1, '2025-12-01'),
(1, '2025-12-03'),
(2, '2025-12-02'),
(3, '2025-12-05');

-- Order Items
INSERT INTO order_items (order_id, product_id, quantity) VALUES
(1, 1, 1),  -- Alice buys 1 Laptop
(1, 2, 2),  -- Alice buys 2 Mice
(2, 3, 1),  -- Alice buys 1 Keyboard
(2, 5, 2),  -- Alice buys 2 Chairs
(3, 1, 1),  -- Bob buys 1 Laptop
(3, 4, 1),  -- Bob buys 1 Desk
(4, 2, 3),  -- Charlie buys 3 Mice
(4, 5, 1);  -- Charlie buys 1 Chair

-- ============================================
-- CUBE QUERY EXAMPLE
-- ============================================
-- Total sales by customer and product category
SELECT
    c.country,
    c.name AS customer,
    p.category,
    SUM(oi.quantity * p.price) AS total_sales
FROM order_items oi
JOIN orders o ON oi.order_id = o.order_id
JOIN customers c ON o.customer_id = c.customer_id
JOIN products p ON oi.product_id = p.product_id
GROUP BY CUBE (c.country, c.name, p.category)
ORDER BY c.country, c.name, p.category;
