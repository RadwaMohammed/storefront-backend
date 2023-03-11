# API Requirements
The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as well as data shapes the frontend and backend have agreed meet the requirements of the application. 

## API Endpoints

### Products

- **GET** `/products` : get all products.
```
Response: [{ id: number, name: string, category: string, price: string, description: string }]
```

- **GET** `/products/categories/:category`: get products by category.
```
Response: [{ id: number, name: string, category: string, price: string, description: string }]
```

- **POST** `/products`: create a product [token required].
```
Request: { 
  id: number, // optional
  name: string,
  category: string, // optional
  price: string,
  description: string // optional
}
Response: { id: number, name: string, category: string, price: string, description: string }
```

- **GET** `/products/:id`: get a product by id.
```
Response: { id: number, name: string, category: string, price: string, description: string }
```

- **PUT** `'/products/:id`: update a product by id [token required].
```
Request: { 
  name: string, // optional
  category: string, // optional
  price: string, // optional
  description: string // optional
}
Response: { id: number, name: string, category: string, price: string, description: string }
```

- **DELETE** `/products/:id`: delete a product by id [token required].
```
Response: { id: number, name: string, category: string, price: string, description: string }
```

### Users

- **GET** `/users` : get all users [token required].
```
Response: [{ id: number, firstName: string, lastName: string, username: string, password: string, email: string }]
```

- **POST** `/users`: create a user.
```
Request: {
  id: number, // optional
  firstName: string,
  lastName: string,
  username: string,
  password: string,
  email: string,
}
Response: { id: number, firstName: string, lastName: string, username: string, password: string, email: string }
```

- **GET** `/users/:id`: get a user by id [token required].
```
Response: { id: number, firstName: string, lastName: string, username: string, password: string, email: string }
```

- **PUT** `'/users/:id`: update a user by id [token required].
```
Request: { 
  firstName: string, // optional
  lastName: string, // optional
  password: string, // optional
  email: string // optional
}
Response: { id: number, firstName: string, lastName: string, username: string, password: string, email: string }
```

- **DELETE** `/users/:id`: delete a user by id [token required].
```
Response: { id: number, firstName: string, lastName: string, username: string, password: string, email: string }
```

- **Authenticate** `/users/authenticate`: authenticate a user.
```
Request: {
  username: string,
  password: string
}
Response: { id: number, firstName: string, lastName: string, username: string, password: string, email: string }
```

### Orders

- **GET** `/orders` : get all orders [token required].
```
Response: [{ id: number, status: string, userId: number }]
```

- **GET** `/orders/order-details`: get orders with its products [token required].
```
Response: [{ orderId: number, userId: number, status: string, products: [{ productId: number, quantity: number }] }]
```

- **POST** `/orders`: create an order [token required].
```
Request: { 
  id: number, // optional
  status: string, 
  userId: number 
}
Response: { id: number, status: string, userId: number }
```

- **GET** `/orders/:id`: get an order by id [token required].
```
Response: { id: number, status: string, userId: number }
```

- **PUT** `'/orders/:id`: update status of an order by id [token required].
```
Request: { status: string }
Response: { id: number, status: string, userId: number }
```

- **DELETE** `/orders/:id`: delete an order by id[token required].
```
Response: { id: number, status: string, userId: number }
```

- **GET** `/orders/:id/order-details`: get an order with its products by id [token required].
```
Response: { orderId: number, userId: number, status: string, products: [{ productId: number, quantity: number }] }
```

- **GET** `/orders/:id/products`: get products of an order by id [token required].
```
Response: [{ productId: number, quantity: number }]
```

- **POST** `/orders/:id/products`: add a product to an order by id [token required].
```
Request: { 
  productId: number,
  quantity: number // optional
}
Response: { orderId: number, productId: number, quantity: number }
```

- **DELETE** `/orders/:id/products/:product`: remove a product from an order [token required].
```
Response: { productId: number, quantity: number }
```

- **DELETE** `/orders/:id/products`: remove all products in an order [token required].
```
Response: [{ productId: number, quantity: number }]
```

- **PUT** `/orders/:id/products/:product`: update the quantity a product in an order [token required].
```
Request: { quantity: number }
Response: { orderId, productId: number, quantity: number }
```

- **GET** `/users/:user/orders` : get all orders of a user [token required].
```
Response: [{ orderId: number, userId: number, status: string, products: [{ productId: number, quantity: number }] }]
```

- **GET** `/users/:user/orders/active` : get all active orders of a user [token required].
```
Response: [{ orderId: number, userId: number, status: string, products: [{ productId: number, quantity: number }] }]
```

- **GET** `/users/:user/orders/complete` : get all complete orders of a user [token required].
```
Response: [{ orderId: number, userId: number, status: string, products: [{ productId: number, quantity: number }] }]
```

- **DELETE** `/users/:user/orders` : delete all orders of a user [token required].
```
Response: [{ id: number, status: string, userId: number }]
```

- **DELETE** `/users/:user/orders/active` : delete all active orders of a user [token required].
```
Response: [{ id: number, status: string, userId: number }]
```

- **DELETE** `/users/:user/orders/complete` : delete all complete orders of a user [token required].
```
Response: [{ id: number, status: string, userId: number }]
```

## Data Shapes
#### Product
-  id
- name
- [OPTIONAL] category
- price
- [OPTIONAL] description

| Column        | Type                                |
|:------------- |:------------------------------------|
| id            | SERIAL PRIMARY KEY                  |
| name          | VARCHAR(100) NOT NULL               |
| category      | VARCHAR(50) NOT NULL DEFAULT 'other'|
| price         | DECIMAL NOT NULL                    |
| description   | TEXT DEFAULT ''                     |

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'other',
  price decimal NOT NULL,
  description TEXT DEFAULT ''
);
```

#### User
- id
- firstName
- lastName
- username
- email
- password

| Column            | Type                            |
|:------------------|:--------------------------------|
| id                | SERIAL PRIMARY KEY              |
| first_name        | VARCHAR(100) NOT NULL           |
| last_name         | VARCHAR(100) NOT NULL           |
| username          | VARCHAR(50) NOT NULL UNIQUE     |
| email             | VARCHAR(255) NOT NULL UNIQUE    |
| password_digest   | VARCHAR(255) NOT NULL           |

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_digest VARCHAR(255) NOT NULL
);
```

#### Orders
- id
- user_id
- status of order (active or complete)

| Column      | Type                                  |
|:------------|:--------------------------------------|
| id          | SERIAL PRIMARY KEY                    |
| user_id     | FOREIGN KEY to USERS                  |
| status      | VARCHAR(20) NOT NULL DEFAULT 'active' |

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id),
  status VARCHAR(20) CHECK (status IN('active', 'complete')) NOT NULL DEFAULT 'active'
);
```

#### Order-Products
- id
- quantity
- order_id
- product_id

| Column        | Type                                |
|:--------------|:------------------------------------|
| id            | SERIAL PRIMARY KEY                  |
| quantity      | INTEGER NOT NULL DEFAULT 1          |
| order_id      | FOREIGN KEY to ORDERS               |
| product_id    | FOREIGN KEY to PRODUCTS             |

```sql
CREATE TABLE order_products (
  id SERIAL PRIMARY KEY,
  quantity integer NOT NULL DEFAULT 1,
  order_id integer NOT NULL REFERENCES orders(id),
  product_id integer NOT NULL REFERENCES products(id)
);
```