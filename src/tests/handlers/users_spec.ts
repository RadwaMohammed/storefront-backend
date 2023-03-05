import supertest from 'supertest';
import app from '../../server';
import { resetUsersTable } from '../utils/reset';

const request = supertest(app);
let token: string;

describe('Users Handler', () => {
  // Before all the tests
  beforeAll(async (): Promise<void> => {
    //  Reset the tables
    await resetUsersTable();
  });

  // After all the tests
  afterAll(async (): Promise<void> => {
    //  Reset the tables
    await resetUsersTable();
  });

  // Tests for POST '/users' endpoint
  describe(`POST '/users' endpoint responses`, (): void => {
    it('responds with 400 if there is a missing a mandatory key or with no value', async (): Promise<void> => {
      const response = await request.post('/users').send({
        last_name: 'Doe',
        username: 'john_doe',
        password: 'pass@store123',
        email: 'mail2johndoe@gmail.com'
      });
      expect(response.status).toEqual(400);
    });

    it('responds with 200 if the user has been successfully created and return the token', async (): Promise<void> => {
      const response = await request.post('/users').send({
        first_name: 'John',
        last_name: 'Doe',
        username: 'john_doe',
        password: 'pass@store123',
        email: 'mail2johndoe@gmail.com'
      });
      expect(response.status).toEqual(200);
      // Get the token in order to use it in the remaining tests
      token = response.body;
    });
  });

  // Tests for POST '/users/authenticate' endpoint
  describe(`POST '/users/authenticate' endpoint responses`, (): void => {
    it('responds with 400 if there is a missing  key username or password', async (): Promise<void> => {
      const response = await request.post('/users/authenticate').send({
        username: 'john_doe'
      });
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if there is a user with the provided username', async (): Promise<void> => {
      const response = await request.post('/users/authenticate').send({
        username: 'john_Tom',
        password: 'pass@store123'
      });
      expect(response.status).toEqual(404);
    });

    it('responds with 401 if the password was wrong', async (): Promise<void> => {
      const response = await request.post('/users/authenticate').send({
        username: 'john_doe',
        password: 'rrtt0023'
      });
      expect(response.status).toEqual(401);
    });

    it('responds with 200 if the user was successfully authenticated', async (): Promise<void> => {
      const response = await request.post('/users/authenticate').send({
        username: 'john_doe',
        password: 'pass@store123'
      });
      expect(response.status).toEqual(200);
    });
  });

  // Tests for GET '/users' endpoint
  describe(`GET '/users' endpoint responses`, (): void => {
    it('respond with 401 if the user was not logged in', async (): Promise<void> => {
      const response = await request.get('/users');
      expect(response.status).toEqual(401);
    });

    it('respond with 200 if the user and return a list of users', async (): Promise<void> => {
      const response = await request
        .get('/users')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(200);
    });
  });

  // Tests for GET '/users/:id' endpoint
  describe(`GET '/users/:id' endpoint responses`, (): void => {
    it('responds with 400 if the id not valid id', async (): Promise<void> => {
      const response = await request
        .get('/users/rr2')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if the user not found', async (): Promise<void> => {
      const response = await request
        .get('/users/88')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(404);
    });

    it('respond with 401 if the user was not logged in', async (): Promise<void> => {
      const response = await request.get('/users/1');
      expect(response.status).toEqual(401);
    });

    it('responds with 200 and return the user', async (): Promise<void> => {
      const response = await request
        .get('/users/1')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(200);
    });
  });

  // Tests for PUT '/users/:id' endpoint
  describe(`PUT '/users/:id' endpoint responses`, (): void => {
    it('responds with 400 if the id not valid id', async (): Promise<void> => {
      const response = await request
        .put('/users/rr2')
        .set('Authorization', `Bearer ${token}`)
        .send({ last_name: 'Ali' });
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if the user to be update not found', async (): Promise<void> => {
      const response = await request
        .put('/users/88')
        .set('Authorization', `Bearer ${token}`)
        .send({ last_name: 'Ali' });
      expect(response.status).toEqual(404);
    });

    it('responds with 400 if there there is a missing value', async (): Promise<void> => {
      const response = await request
        .put('/users/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ last_name: '' });
      expect(response.status).toEqual(400);
    });

    it('responds with 405 if the user try to modify username that not allowed', async (): Promise<void> => {
      const response = await request
        .put('/users/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'john_ali' });
      expect(response.status).toEqual(405);
    });

    it('responds with 401 if the user not logged in', async (): Promise<void> => {
      const response = await request.put('/users/1').send({ last_name: 'Ali' });
      expect(response.status).toEqual(401);
    });

    it('responds with 200 if the user successfully updated and return it', async (): Promise<void> => {
      const response = await request
        .put('/users/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ last_name: 'Ali' });
      expect(response.status).toEqual(200);
      expect(response.body.lastName).toEqual('Ali');
    });
  });

  // Tests for DELETE '/users/:id' endpoint
  describe(`DELETE '/users/:id' endpoint responses`, (): void => {
    it('responds with 400 if the id not valid id', async (): Promise<void> => {
      const response = await request
        .delete('/users/rr2')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(400);
    });

    it('responds with 404 if the user to be deleted not found', async (): Promise<void> => {
      const response = await request
        .delete('/users/88')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(404);
    });

    it('responds with 401 if the user not logged in', async (): Promise<void> => {
      const response = await request.delete('/users/1');
      expect(response.status).toEqual(401);
    });

    it('responds with 200 if the user successfully deleted', async (): Promise<void> => {
      const response = await request
        .delete('/users/1')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(200);
      // Check if the user removed from the database
      const user = await request
        .get('/users/1')
        .set('Authorization', `Bearer ${token}`);
      expect(user.status).toEqual(404);
    });
  });
});
