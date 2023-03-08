import supertest from 'supertest';
import jwt, { Secret } from 'jsonwebtoken';
import app from '../../server';
import { ProductStore } from '../../models/product';
import { UserStore } from '../../models/user';
import { resetProductsTable, resetUsersTable } from '../../utils/reset';
import { Product, User } from '../../utils/types';

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
describe('Products Handler', () => {
  // Before all the tests
  beforeAll(async (): Promise<void> => {
    //  Reset the tables
    await resetUsersTable();
    await resetProductsTable();
    // Create a user to use for authurization
    const u = await uStore.create(testUser);
    token = jwt.sign({ user: u }, TOKEN_SECRET);
  });

  // After all the tests
  afterAll(async (): Promise<void> => {
    //  Reset the tables
    await resetUsersTable();
    await resetProductsTable();
  });

  // Tests for POST '/products' endpoint
  describe(`POST '/products' endpoint responses`, (): void => {
    it('responds with 400 if there is a missing a mandatory key or with no value', async (): Promise<void> => {
      const response = await request
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          category: 'Sporting Goods',
          price: '20'
        });
      expect(response.status).toEqual(400);
    });

    it('responds with 400 if the price key is not a valid positive number', async (): Promise<void> => {
      const response = await request
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Skipping Jump Rope',
          category: 'Sporting_Goods',
          price: '-20',
          description:
            'This skipping rope is made of high-quality material and does not break easily.'
        });
      expect(response.status).toEqual(400);
    });

    it('responds with 200 if the product has been successfully created and return it', async (): Promise<void> => {
      const response = await request
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send(testProduct);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ id: 1, ...testProduct });
    });

    it('responds with 401 if the user who create the product not logged in', async (): Promise<void> => {
      const response = await request.post('/products').send(testProduct);
      expect(response.status).toEqual(401);
    });
  });

  // Tests for GET '/products' endpoint
  describe(`GET '/products' endpoint responses`, (): void => {
    it('respond with 200 and return list of the products', async (): Promise<void> => {
      const response = await request.get('/products');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([{ id: 1, ...testProduct }]);
    });
  });

  // Tests for GET '/products/categories/:category' endpoint
  describe(`GET '/products/categories/:category' endpoint responses`, (): void => {
    it('respond with 200 and return list of the products by the category', async (): Promise<void> => {
      // create products to test if it return a list filtered by category
      await pStore.create({
        name: 'Metal Door',
        price: '120'
      });
      await pStore.create({
        name: 'Batteries',
        category: 'Electronics',
        price: '50'
      });
      await pStore.create({
        name: 'iPhone Charger',
        category: 'Electronics',
        price: '30'
      });
      await pStore.create({
        name: 'Basketball',
        category: 'Sporting_Goods',
        price: '300'
      });
      const response = await request.get('/products/categories/Electronics');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([
        {
          id: 3,
          name: 'Batteries',
          category: 'Electronics',
          price: '50',
          description: ''
        },
        {
          id: 4,
          name: 'iPhone Charger',
          category: 'Electronics',
          price: '30',
          description: ''
        }
      ]);
    });
  });

  // Tests for GET '/products/:id' endpoint
  describe(`GET '/products/:id' endpoint responses`, (): void => {
    it('responds with 400 if the id not valid id', async (): Promise<void> => {
      const response = await request.get('/products/rr2');
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if the product not found', async (): Promise<void> => {
      const response = await request.get('/products/88');
      expect(response.status).toEqual(404);
    });

    it('responds with 200 and return the product', async (): Promise<void> => {
      const response = await request.get('/products/1');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ id: 1, ...testProduct });
    });
  });

  // Tests for PUT '/products/:id' endpoint
  describe(`PUT '/products/:id' endpoint responses`, (): void => {
    it('responds with 400 if the id not valid id', async (): Promise<void> => {
      const response = await request
        .put('/products/rr2')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Black Skipping Jump Rope' });
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if the product to be update not found', async (): Promise<void> => {
      const response = await request
        .put('/products/88')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Black Skipping Jump Rope' });
      expect(response.status).toEqual(404);
    });

    it('responds with 400 if there there is a missing value', async (): Promise<void> => {
      const response = await request
        .put('/products/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' });
      expect(response.status).toEqual(400);
    });

    it('responds with 400 if the price key is not a valid positive number', async (): Promise<void> => {
      const response = await request
        .put('/products/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ price: 'five' });
      expect(response.status).toEqual(400);
    });

    it('responds with 401 if the user who update the product not logged in', async (): Promise<void> => {
      const response = await request
        .put('/products/1')
        .send({ name: 'Black Skipping Jump Rope' });
      expect(response.status).toEqual(401);
    });

    it('responds with 200 if the product successfully updated and return it', async (): Promise<void> => {
      const response = await request
        .put('/products/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Black Skipping Jump Rope' });
      expect(response.status).toEqual(200);
      expect(response.body.name).toEqual('Black Skipping Jump Rope');
      expect(response.body).toEqual({
        id: 1,
        name: 'Black Skipping Jump Rope',
        category: 'Sporting_Goods',
        price: '20',
        description:
          'This skipping rope is made of high-quality material and does not break easily.'
      });
    });
  });

  // Tests for DELETE '/products/:id' endpoint
  describe(`DELETE '/products/:id' endpoint responses`, (): void => {
    it('responds with 400 if the id not valid id', async (): Promise<void> => {
      const response = await request
        .delete('/products/rr2')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if the product to be deleted not found', async (): Promise<void> => {
      const response = await request
        .delete('/products/8')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(404);
    });

    it('responds with 401 if the user who delete the product not logged in', async (): Promise<void> => {
      const response = await request.delete('/products/1');
      expect(response.status).toEqual(401);
    });

    it('responds with 200 if the product successfully deleted, and return the deleted product', async (): Promise<void> => {
      const response = await request
        .delete('/products/1')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        id: 1,
        name: 'Black Skipping Jump Rope',
        category: 'Sporting_Goods',
        price: '20',
        description:
          'This skipping rope is made of high-quality material and does not break easily.'
      });
      // Check if the product removed from the database
      const product = await request.get('/products/1');
      expect(product.status).toEqual(404);
    });
  });
});
