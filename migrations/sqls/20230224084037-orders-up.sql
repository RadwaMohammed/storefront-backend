CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id),
  status VARCHAR(20) CHECK (status IN('active', 'complete')) NOT NULL DEFAULT 'active'
);