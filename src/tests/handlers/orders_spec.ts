import supertest from 'supertest';
import jwt, { Secret } from 'jsonwebtoken';
import app from '../../server';
import { ProductStore } from '../../models/product';
import { UserStore } from '../../models/user';
import { Product, User } from '../../utils/types';
import { resetAllTables } from './../../utils/reset';

const request = supertest(app);
const uStore = new UserStore();
const pStore = new ProductStore();
const TOKEN_SECRET = process.env.TOKEN_SECRET as Secret;
let token: string;
const testUser: User = {
  firstName: 'John',
  lastName: 'Doe',
  username: 'john_doe',
  password: 'pass@store123',
  email: 'mail2johndoe@gmail.com'
};
const testProduct: Product = {
  name: 'Skipping Jump Rope',
  category: 'Sporting_Goods',
  price: '20',
  description:
    'This skipping rope is made of high-quality material and does not break easily.'
};
const testProduct2: Product = {
  name: 'Red Skipping Jump Rope',
  category: 'Sporting_Goods',
  price: '10',
  description: ''
};
describe('Orders Handler', () => {
  // Before all the tests
  beforeAll(async (): Promise<void> => {
    //  Reset the tables
    await resetAllTables();
    // Create a user to use for authurization
    const u = await uStore.create(testUser);
    token = jwt.sign({ user: u }, TOKEN_SECRET);
    // Create a product for tests
    await pStore.create(testProduct);
    await pStore.create(testProduct2);
  });

  // After all the tests
  afterAll(async (): Promise<void> => {
    //  Reset the tables
    await resetAllTables();
  });

  // Tests for POST '/orders' endpoint - create an order
  describe(`POST '/orders' endpoint responses to create an order`, (): void => {
    it('responds with 400 if there is a missing a key or with key with no value', async (): Promise<void> => {
      const response = await request
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user_id: '',
          status: 'active'
        });
      expect(response.status).toEqual(400);
    });

    it('responds with 400 if the user_id is not a valid id', async (): Promise<void> => {
      const response = await request
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user_id: 'it20',
          status: 'active'
        });
      expect(response.status).toEqual(400);
    });

    it('responds with 400 if the status is not valid value', async (): Promise<void> => {
      const response = await request
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user_id: '1',
          status: 'aaa'
        });
      expect(response.status).toEqual(400);
    });

    it('responds with 200 if the order has been successfully created', async (): Promise<void> => {
      const response = await request
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user_id: '1',
          status: 'active'
        });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        id: 1,
        userId: 1,
        status: 'active'
      });
    });

    it('responds with 401 if the user who create the order not logged in', async (): Promise<void> => {
      const response = await request.post('/orders').send({
        user_id: 1,
        status: 'active'
      });
      expect(response.status).toEqual(401);
    });
  });

  // Tests for POST '/orders/:id/products' endpoint - add product to an order
  describe(`POST '/orders/:id/products' endpoint responses to add a product to an order`, (): void => {
    it('responds with 400 if the product_id is missing or empty', async (): Promise<void> => {
      const response = await request
        .post('/orders/1/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: '',
          quantity: 20
        });
      expect(response.status).toEqual(400);
    });

    it('responds with 400 if the product_id is not a valid id', async (): Promise<void> => {
      const response = await request
        .post('/orders/1/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: 'it20',
          quantity: 1
        });
      expect(response.status).toEqual(400);
    });

    it('responds with 400 if the quantity is not a positive number', async (): Promise<void> => {
      const response = await request
        .post('/orders/1/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: 1,
          quantity: -20
        });
      expect(response.status).toEqual(400);
    });

    it('responds with 400 if the order id not valid', async (): Promise<void> => {
      const response = await request
        .post('/orders/rrt0/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: 1,
          quantity: 20
        });
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if the order id not found', async (): Promise<void> => {
      const response = await request
        .post('/orders/8/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: 1,
          quantity: 20
        });
      expect(response.status).toEqual(404);
    });

    it('responds with 401 if the user who add the product not logged in', async (): Promise<void> => {
      const response = await request.post('/orders/1/products').send({
        product_id: 1,
        quantity: 20
      });
      expect(response.status).toEqual(401);
    });

    it('responds with 200 if the product has been successfully added to the order', async (): Promise<void> => {
      const response = await request
        .post('/orders/1/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: 1,
          quantity: 20
        });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        orderId: 1,
        productId: 1,
        quantity: 20
      });
    });

    it('responds with 200 if the product already exists in the order, it will sum the quantity to that product', async (): Promise<void> => {
      const response = await request
        .post('/orders/1/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: 1,
          quantity: 5
        });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        orderId: 1,
        productId: 1,
        quantity: 25
      });
    });

    it('responds with 200 if the product already exists in the order, it will increment the quantity by one (default value) if not specified.', async (): Promise<void> => {
      const response = await request
        .post('/orders/1/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: 1
        });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        orderId: 1,
        productId: 1,
        quantity: 26
      });
    });

    it('responds with 422 if the status of the order is complete.', async (): Promise<void> => {
      // add an order with status complete for test
      await request
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user_id: 1,
          status: 'complete'
        });
      const response = await request
        .post('/orders/2/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: 1,
          quantity: 2
        });
      expect(response.status).toEqual(422);
    });
  });

  // Tests for PUT '/orders/:id' endpoint - update Status of an order
  describe(`PUT '/orders/:id' endpoint responses to update status of an order`, (): void => {
    it('responds with 400 if the id not valid id', async (): Promise<void> => {
      const response = await request
        .put('/orders/rr2')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'active' });
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if the order to be update not found', async (): Promise<void> => {
      const response = await request
        .put('/orders/88')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'active' });
      expect(response.status).toEqual(404);
    });

    it('responds with 400 if status has no value or missing', async (): Promise<void> => {
      const response = await request
        .put('/orders/2')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: '' });
      expect(response.status).toEqual(400);
    });

    it('responds with 400 if status value not <active> or <complete>', async (): Promise<void> => {
      const response = await request
        .put('/orders/2')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'aaaa' });
      expect(response.status).toEqual(400);
    });

    it('responds with 401 if the user who update the order not logged in', async (): Promise<void> => {
      const response = await request
        .put('/orders/2')
        .send({ status: 'active' });
      expect(response.status).toEqual(401);
    });

    it('responds with 200 if the status of tha order successfully updated', async (): Promise<void> => {
      const response = await request
        .put('/orders/2')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'active' });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        id: 2,
        userId: 1,
        status: 'active'
      });
    });
  });

  // Tests for PUT '/orders/:id/products/:product' endpoint - update quantity of a product in an order
  describe(`PUT '/orders/:id/products/:product' endpoint responses to update quantity of a product in an order`, (): void => {
    it('responds with 400 if the id of order not valid id', async (): Promise<void> => {
      const response = await request
        .put('/orders/rr2/products/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 3 });
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if the order to be update not found', async (): Promise<void> => {
      const response = await request
        .put('/orders/88/products/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 3 });
      expect(response.status).toEqual(404);
    });

    it('responds with 400 if the id of product not valid id', async (): Promise<void> => {
      const response = await request
        .put('/orders/1/products/rr0')
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 3 });
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if the product to be update not found in the order', async (): Promise<void> => {
      const response = await request
        .put('/orders/1/products/2')
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 3 });
      expect(response.status).toEqual(404);
    });

    it('responds with 400 if the quantity has no value or missing', async (): Promise<void> => {
      const response = await request
        .put('/orders/1/products/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: '' });
      expect(response.status).toEqual(400);
    });

    it('responds with 400 if the quantity value not valid ', async (): Promise<void> => {
      const response = await request
        .put('/orders/1/products/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: -10 });
      expect(response.status).toEqual(400);
    });

    it('responds with 401 if the user who update the quantity not logged in', async (): Promise<void> => {
      const response = await request
        .put('/orders/1/products/1')
        .send({ quantity: 3 });
      expect(response.status).toEqual(401);
    });

    it('responds with 200 if the quantity of tha product successfully updated', async (): Promise<void> => {
      const response = await request
        .put('/orders/1/products/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 3 });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        orderId: 1,
        productId: 1,
        quantity: 3
      });
    });
  });

  // Tests for GET '/orders' endpoint - get all orders
  describe(`GET '/orders' endpoint responses to get all orders`, (): void => {
    it('respond with 200 if get successfully the orders', async (): Promise<void> => {
      const response = await request
        .get('/orders')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([
        { id: 1, userId: 1, status: 'active' },
        { id: 2, userId: 1, status: 'active' }
      ]);
    });

    it('responds with 401 if the user who request orders not logged in', async (): Promise<void> => {
      const response = await request.get('/orders');
      expect(response.status).toEqual(401);
    });
  });

  // Tests for GET '/orders/order-details' endpoint - get all orders with details
  describe(`GET '/orders/order-details' endpoint responses to get all orders with details`, (): void => {
    it('respond with 200 if get successfully the orders details', async (): Promise<void> => {
      const response = await request
        .get('/orders/order-details')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([
        {
          orderId: 1,
          userId: 1,
          status: 'active',
          products: [{ productId: 1, quantity: 3 }]
        },
        { orderId: 2, userId: 1, status: 'active', products: [] }
      ]);
    });

    it('responds with 401 if the user who request orders with details not logged in', async (): Promise<void> => {
      const response = await request.get('/orders/order-details');
      expect(response.status).toEqual(401);
    });
  });

  // Tests for GET '/orders/:id' endpoint - get order by id
  describe(`GET '/orders/:id' endpoint responses to get an order by id`, (): void => {
    it('responds with 400 if the id not valid id', async (): Promise<void> => {
      const response = await request
        .get('/orders/rr2')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if the order not found', async (): Promise<void> => {
      const response = await request
        .get('/orders/88')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(404);
    });

    it('responds with 401 if the user who request the order not logged in', async (): Promise<void> => {
      const response = await request.get('/orders/1');
      expect(response.status).toEqual(401);
    });

    it('responds with 200 if get successfully the order', async (): Promise<void> => {
      const response = await request
        .get('/orders/1')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ id: 1, userId: 1, status: 'active' });
    });
  });

  // Tests for GET '/orders/:id/order-details' endpoint - get order details by id
  describe(`GET '/orders/:id/order-details' endpoint responses to get an order details by id`, (): void => {
    it('responds with 400 if the id not valid id', async (): Promise<void> => {
      const response = await request
        .get('/orders/rr2/order-details')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if the order not found', async (): Promise<void> => {
      const response = await request
        .get('/orders/88/order-details')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(404);
    });

    it('responds with 401 if the user who request the order not logged in', async (): Promise<void> => {
      const response = await request.get('/orders/1/order-details');
      expect(response.status).toEqual(401);
    });

    it('responds with 200 if get successfully the order details', async (): Promise<void> => {
      const response = await request
        .get('/orders/1/order-details')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        orderId: 1,
        userId: 1,
        status: 'active',
        products: [{ productId: 1, quantity: 3 }]
      });
    });
  });

  // Tests for GET '/orders/:id/products' endpoint - get products of an order
  describe(`GET '/orders/:id/products' endpoint responses to get products of an order`, (): void => {
    it('responds with 400 if the id not valid id', async (): Promise<void> => {
      const response = await request
        .get('/orders/rr2/products')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if the order not found', async (): Promise<void> => {
      const response = await request
        .get('/orders/88/products')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(404);
    });

    it('responds with 401 if the user who request the order not logged in', async (): Promise<void> => {
      const response = await request.get('/orders/1/products');
      expect(response.status).toEqual(401);
    });

    it('responds with 200 if get successfully the products of the order', async (): Promise<void> => {
      const response = await request
        .get('/orders/1/products')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([{ productId: 1, quantity: 3 }]);
    });
  });

  // Tests for DELETE '/orders/:id' endpoint - delete an order by id
  describe(`DELETE '/orders/:id' endpoint responses to delete an order`, (): void => {
    it('responds with 400 if the id not valid id', async (): Promise<void> => {
      const response = await request
        .delete('/orders/rr2')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if the order to be deleted not found', async (): Promise<void> => {
      const response = await request
        .delete('/orders/8')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(404);
    });

    it('responds with 401 if the user who delete the order not logged in', async (): Promise<void> => {
      const response = await request.delete('/orders/1');
      expect(response.status).toEqual(401);
    });

    it('responds with 200 if the order successfully deleted, and return the deleted order', async (): Promise<void> => {
      const response = await request
        .delete('/orders/1')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ id: 1, userId: 1, status: 'active' });
      // Check if the order removed from the database
      const order = await request
        .get('/orders/1')
        .set('Authorization', `Bearer ${token}`);
      expect(order.status).toEqual(404);
    });
  });

  // Tests for DELETE '/orders/:id/products/:product' endpoint - delete a product from an order
  describe(`DELETE '/orders/:id/products/:product' endpoint responses to delete a product from an order`, (): void => {
    it('responds with 400 if the order id not valid id', async (): Promise<void> => {
      // add product to order for tests
      await request
        .post('/orders/2/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: 2,
          quantity: 3
        });
      const response = await request
        .delete('/orders/rr2/products/2')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(400);
    });

    it('responds with 400 if the product id not valid id', async (): Promise<void> => {
      const response = await request
        .delete('/orders/2/products/rr1')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if the order not found', async (): Promise<void> => {
      const response = await request
        .delete('/orders/88/products/1')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(404);
    });

    it('responds with 404 if the product to be deleted not found in the order', async (): Promise<void> => {
      const response = await request
        .delete('/orders/2/products/1')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(404);
    });

    it('responds with 401 if the user who delete the order not logged in', async (): Promise<void> => {
      const response = await request.delete('/orders/2/products/2');
      expect(response.status).toEqual(401);
    });

    it('responds with 200 if the product successfully deleted', async (): Promise<void> => {
      const response = await request
        .delete('/orders/2/products/2')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ productId: 2, quantity: 3 });
      // Check if the order removed from the database
      const products = await request
        .get('/orders/2/products')
        .set('Authorization', `Bearer ${token}`);
      expect(products.body).toEqual([]);
    });
  });

  // Tests for DELETE '/orders/:id/products' endpoint - delete all products of an order
  describe(`DELETE '/orders/:id/products' endpoint responses to delete all products of an order`, (): void => {
    it('responds with 400 if the order id not valid id', async (): Promise<void> => {
      // add product to order for tests
      await request
        .post('/orders/2/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: 2,
          quantity: 3
        });
      await request
        .post('/orders/2/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: 1,
          quantity: 5
        });

      const response = await request
        .delete('/orders/rr2/products')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if the order not found', async (): Promise<void> => {
      const response = await request
        .delete('/orders/88/products')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(404);
    });

    it('responds with 401 if the user who delete the order not logged in', async (): Promise<void> => {
      const response = await request.delete('/orders/2/products');
      expect(response.status).toEqual(401);
    });

    it('responds with 200 if all product was successfully deleted', async (): Promise<void> => {
      const response = await request
        .delete('/orders/2/products')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([
        { productId: 2, quantity: 3 },
        { productId: 1, quantity: 5 }
      ]);
      // Check if the order removed from the database
      const products = await request
        .get('/orders/2/products')
        .set('Authorization', `Bearer ${token}`);
      expect(products.body).toEqual([]);
    });
  });

  // Tests for GET '/users/:user/orders' endpoint - get all orders for a user
  describe(`GET '/users/:user/orders' endpoint responses to gat all orders for a user`, (): void => {
    it('responds with 400 if the user id not valid id', async (): Promise<void> => {
      // add orders to a user for tests
      await request
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user_id: 1,
          status: 'active'
        });
      await request
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user_id: 1,
          status: 'complete'
        });
      await request
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user_id: 1,
          status: 'active'
        });
      await request
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user_id: 1,
          status: 'complete'
        });
      await request
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user_id: 1,
          status: 'active'
        });
      await request
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user_id: 1,
          status: 'active'
        });

      const response = await request
        .get('/users/rdd/orders')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if the user not found', async (): Promise<void> => {
      const response = await request
        .get('/users/5/orders')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(404);
    });

    it('responds with 401 if the user who request the orders not logged in', async (): Promise<void> => {
      const response = await request.get('/users/1/orders');
      expect(response.status).toEqual(401);
    });

    it('responds with 200 if all orders of a user was successfully received', async (): Promise<void> => {
      const response = await request
        .get('/users/1/orders')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([
        { orderId: 2, status: 'active', products: [] },
        { orderId: 3, status: 'active', products: [] },
        { orderId: 4, status: 'complete', products: [] },
        { orderId: 5, status: 'active', products: [] },
        { orderId: 6, status: 'complete', products: [] },
        { orderId: 7, status: 'active', products: [] },
        { orderId: 8, status: 'active', products: [] }
      ]);
    });
  });

  // Tests for GET '/users/:user/orders/active' endpoint - get all active orders for a user
  describe(`GET '/users/:user/orders/active' endpoint responses to gat all active orders for a user`, (): void => {
    it('responds with 400 if the user id not valid id', async (): Promise<void> => {
      const response = await request
        .get('/users/rdd/orders/active')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if the user not found', async (): Promise<void> => {
      const response = await request
        .get('/users/5/orders/active')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(404);
    });

    it('responds with 401 if the user who request the orders not logged in', async (): Promise<void> => {
      const response = await request.get('/users/1/orders/active');
      expect(response.status).toEqual(401);
    });

    it('responds with 200 if all active orders of a user was successfully received', async (): Promise<void> => {
      const response = await request
        .get('/users/1/orders/active')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([
        { orderId: 2, status: 'active', products: [] },
        { orderId: 3, status: 'active', products: [] },
        { orderId: 5, status: 'active', products: [] },
        { orderId: 7, status: 'active', products: [] },
        { orderId: 8, status: 'active', products: [] }
      ]);
    });
  });

  // Tests for GET '/users/:user/orders/complete' endpoint - get all complete orders for a user
  describe(`GET '/users/:user/orders/complete' endpoint responses to gat all complete orders for a user`, (): void => {
    it('responds with 400 if the user id not valid id', async (): Promise<void> => {
      const response = await request
        .get('/users/rdd/orders/complete')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if the user not found', async (): Promise<void> => {
      const response = await request
        .get('/users/5/orders/complete')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(404);
    });

    it('responds with 401 if the user who request the orders not logged in', async (): Promise<void> => {
      const response = await request.get('/users/1/orders/complete');
      expect(response.status).toEqual(401);
    });

    it('responds with 200 if all complete orders of a user was successfully received', async (): Promise<void> => {
      const response = await request
        .get('/users/1/orders/complete')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([
        { orderId: 4, status: 'complete', products: [] },
        { orderId: 6, status: 'complete', products: [] }
      ]);
    });
  });

  // Tests for DELETE '/users/:user/orders/active' endpoint - delete all active orders for a user
  describe(`DELETE '/users/:user/orders/active' endpoint responses to delete all active orders for a user`, (): void => {
    it('responds with 400 if the user id not valid id', async (): Promise<void> => {
      const response = await request
        .delete('/users/rdd/orders/active')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if the user not found', async (): Promise<void> => {
      const response = await request
        .delete('/users/5/orders/active')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(404);
    });

    it('responds with 401 if the user who request the orders not logged in', async (): Promise<void> => {
      const response = await request.delete('/users/1/orders/active');
      expect(response.status).toEqual(401);
    });

    it('responds with 200 if all active orders of a user was successfully deleted', async (): Promise<void> => {
      const response = await request
        .delete('/users/1/orders/active')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([
        { id: 2, status: 'active', userId: 1 },
        { id: 3, status: 'active', userId: 1 },
        { id: 5, status: 'active', userId: 1 },
        { id: 7, status: 'active', userId: 1 },
        { id: 8, status: 'active', userId: 1 }
      ]);
      // Check if active orders were deleted
      const activeOrders = await request
        .get('/users/1/orders/active')
        .set('Authorization', `Bearer ${token}`);
      expect(activeOrders.body).toEqual([]);
    });
  });

  // Tests for DELETE '/users/:user/orders/complete' endpoint - delete all complete orders for a user
  describe(`DELETE '/users/:user/orders/complete' endpoint responses to delete all complete orders for a user`, (): void => {
    it('responds with 400 if the user id not valid id', async (): Promise<void> => {
      const response = await request
        .delete('/users/rdd/orders/complete')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if the user not found', async (): Promise<void> => {
      const response = await request
        .delete('/users/5/orders/complete')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(404);
    });

    it('responds with 401 if the user who request the orders not logged in', async (): Promise<void> => {
      const response = await request.delete('/users/1/orders/complete');
      expect(response.status).toEqual(401);
    });

    it('responds with 200 if all complete orders of a user was successfully deleted', async (): Promise<void> => {
      const response = await request
        .delete('/users/1/orders/complete')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([
        { id: 4, status: 'complete', userId: 1 },
        { id: 6, status: 'complete', userId: 1 }
      ]);
      // Check if complete orders were deleted
      const completeOrders = await request
        .get('/users/1/orders/complete')
        .set('Authorization', `Bearer ${token}`);
      expect(completeOrders.body).toEqual([]);
    });
  });

  // Tests for DELETE '/users/:user/orders' endpoint - delete all orders for a user
  describe(`DELETE '/users/:user/orders' endpoint responses to delete all orders for a user`, (): void => {
    it('responds with 400 if the user id not valid id', async (): Promise<void> => {
      // add orders to a user for tests
      await request
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user_id: 1,
          status: 'active'
        });
      await request
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user_id: 1,
          status: 'complete'
        });
      const response = await request
        .delete('/users/rdd/orders')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if the user not found', async (): Promise<void> => {
      const response = await request
        .delete('/users/5/orders')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(404);
    });

    it('responds with 401 if the user who request the orders not logged in', async (): Promise<void> => {
      const response = await request.delete('/users/1/orders');
      expect(response.status).toEqual(401);
    });

    it('responds with 200 if all orders of a user was successfully deleted', async (): Promise<void> => {
      const response = await request
        .delete('/users/1/orders')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([
        { id: 9, status: 'active', userId: 1 },
        { id: 10, status: 'complete', userId: 1 }
      ]);
      // Check if all orders were deleted
      const orders = await request
        .get('/users/1/orders')
        .set('Authorization', `Bearer ${token}`);
      expect(orders.body).toEqual([]);
    });
  });
});
