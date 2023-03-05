CREATE TABLE order_products (
  id SERIAL PRIMARY KEY,
  quantity integer NOT NULL DEFAULT 1,
  order_id integer NOT NULL REFERENCES orders(id),
  product_id integer NOT NULL REFERENCES products(id)
);