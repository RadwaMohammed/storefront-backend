# Storefront Backend Project

A RESTful API for an online store. The application have tests, keep user information secure, and provide user authentication tokens that are ready to integrate with the frontend.

## Getting Started

Download or Clone the repository to your computer.

## Prerequisites and Local Development

> You should already have node, npm and postgreSQL installed.

### Dependencies

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [body-parser](https://github.com/expressjs/body-parser)
- [node.bcrypt.js](https://github.com/kelektiv/node.bcrypt.js)
- [node-postgres](https://node-postgres.com/)
- [db-migrate](https://db-migrate.readthedocs.io/en/latest/)
- [db-migrate-pg](https://github.com/db-migrate/pg)
- [dotenv](https://github.com/motdotla/dotenv)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)

### Dev dependencies

- [TypeScript](https://www.typescriptlang.org/)
- [Prettier](https://prettier.io/)
- [ESLint](https://eslint.org/)
- [Jasmine](https://jasmine.github.io/)
- [SuperTest](https://www.npmjs.com/package/supertest)
- [tsc-watch](https://github.com/gilamran/tsc-watch)


### Install Dependencies

Navigate to the project directory **/storefront-backend-project** , open your terminal and run: 

`npm install`

### Database Setup

Open psql

`psql -U postgres`

Create the necessary databases for the project **<mystore_db, mystore_db_test>** and create a user **<mystore_db_user>** with all privileges in the databases.
```
CREATE USER mystore_db_user WITH PASSWORD 'password123';
ALTER USER mystore_db_user WITH SUPERUSER;
CREATE DATABASE mystore_db;
GRANT ALL PRIVILEGES ON DATABASE mystore_db TO mystore_db_user;
ALTER DATABASE mystore_db OWNER TO mystore_db_user;
CREATE DATABASE mystore_db_test;
GRANT ALL PRIVILEGES ON DATABASE mystore_db_test TO mystore_db_user;
ALTER DATABASE mystore_db_test OWNER TO mystore_db_user;
```
### Environment Setup

Create **.env** file in the main project directory  **/storefront-backend-project**  to hold the environment variables.

    POSTGRES_HOST=127.0.0.1
    POSTGRES_DB=mystore_db
    POSTGRES_TEST_DB=mystore_db_test
    POSTGRES_USER=mystore_db_user
    POSTGRES_PASSWORD=password123
    ENV=dev
    BCRYPT_PASSWORD=welcome-user-and-login
    SALT_ROUNDS=10
    TOKEN_SECRET=quintessential321

### Ports

- Express server runs on port:  `3000`

- Postgres database on port:  `5432`

### Run Migrations

To create tables for the database:

`npm run migrate-up`

### Start the server

Run: `npm run watch`

Server running at URL: http://127.0.0.1:3000/

## Testing

To test the app run :

`npm run test`

## Endpoints

### Products

- **GET** `/products` : get all products.
- **GET** `/products/categories/:category`: get products by category.
- **POST** `/products`: create a product [token required].
- **GET** `/products/:id`: get a product by id.
- **PUT** `'/products/:id`: update a product by id [token required].
- **DELETE** `/products/:id`: delete a product by id [token required].

### Users

- **GET** `/users` : get all users [token required].
- **POST** `/users`: create a user.
- **GET** `/users/:id`: get a user by id [token required].
- **PUT** `'/users/:id`: update a user by id [token required].
- **DELETE** `/users/:id`: delete a user by id [token required].
- **Authenticate** `/users/authenticate`: authenticate a user.

### Orders

- **GET** `/orders` : get all orders [token required].
- **GET** `/orders/order-details`: get orders with its products [token required].
- **POST** `/orders`: create an order [token required].
- **GET** `/orders/:id`: get an order by id [token required].
- **PUT** `'/orders/:id`: update status of an order by id [token required].
- **DELETE** `/orders/:id`: delete an order by id[token required].
- **GET** `/orders/:id/order-details`: get an order with its products by id [token required].
- **GET** `/orders/:id/products`: get products of an order by id [token required].
- **POST** `/orders/:id/products`: add a product to an order by id [token required].
- **DELETE** `/orders/:id/products/:product`: remove a product from an order [token required].
- **DELETE** `/orders/:id/products`: remove all products in an order [token required].
- **PUT** `/orders/:id/products/:product`: update the quantity a product in an order [token required].
- **GET** `/users/:user/orders` : get all orders of a user [token required].
- **GET** `/users/:user/orders/active` : get all active orders of a user [token required].
- **GET** `/users/:user/orders/complete` : get all complete orders of a user [token required].
- **DELETE** `/users/:user/orders` : delete all orders of a user [token required].
- **DELETE** `/users/:user/orders/active` : delete all active orders of a user [token required].
- **DELETE** `/users/:user/orders/complete` : delete all complete orders of a user [token required].