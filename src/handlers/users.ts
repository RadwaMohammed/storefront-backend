import express, { Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { User, UserStore } from '../models/user';
import verifyAuthToken from '../middlewares/auth';

const store = new UserStore();

// Handler function for the index route
const index = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await store.index();
    res.status(200);
    res.json(users);
  } catch (err) {
    res.status(422);
    res.json(`An error occured. ${err}`);
  }
};

// Handler function for the show route
const show = async (_req: Request, res: Response): Promise<void> => {
  try {
    const user = await store.show(_req.params.id);
    res.status(user ? 200 : 404);
    res.json(user || `User with id ${_req.params.id} not found.`);
  } catch (err) {
    res.status(422);
    res.json(`An error occured. ${err}`);
  }
};

// Handler function for the create route
const create = async (req: Request, res: Response): Promise<void> => {
  try {
    // The requested user to be created
    const user: User = {
      firstName: req.body.first_name,
      lastName: req.body.last_name,
      username: req.body.username,
      password: req.body.password,
      email: req.body.email
    };
    // A type represents all the property names for user object
    type UserKeyType = keyof typeof user;
    // Find if there is a property with no value
    const noValue = Object.keys(user).find(
      (key: string): boolean =>
        !user[key as UserKeyType] || !`${user[key as UserKeyType]}`.trim()
    );
    if (noValue) {
      res.status(400);
      res.json(
        `Please provide a value to the ${
          noValue === 'firstName'
            ? 'first_name'
            : noValue === 'lastName'
            ? 'last_name'
            : noValue
        }, It can't be empty.`
      );
    } else {
      const newUser = await store.create(user);
      // Create token after creating a new user
      const token = jwt.sign(
        { user: newUser },
        process.env.TOKEN_SECRET as Secret
      );
      res.status(200);
      // Passing the token so the user store the token and use it for http requests
      res.json(token);
    }
  } catch (err) {
    res.status(422);
    res.json(`An error occured. ${err}`);
  }
};

// Handler function for the delete route
const destroy = async (_req: Request, res: Response) => {
  try {
    const deletedUser = await store.delete(_req.params.id);
    res.status(deletedUser ? 200 : 404);
    res.json(
      deletedUser || `User with id ${_req.params.id} not found to be deleted.`
    );
  } catch (err) {
    res.status(422);
    res.json(`An error occured. ${err}`);
  }
};

// Handler function for the authenticate route
const authenticate = async (req: Request, res: Response) => {
  try {
    // The requested user to be created
    const user = {
      username: req.body.username,
      password: req.body.password
    };
    const u = await store.authenticate(user.username, user.password);
    const token = jwt.sign({ user: u }, process.env.TOKEN_SECRET as Secret);
    res.status(user ? 200 : 404);
    res.json(
      u ? token : `User with username ${user.username.trim()} not found.`
    );
  } catch (err) {
    res.status(401);
    res.json(`An error occured. ${err}`);
  }
};

const userRoutes = (app: express.Application) => {
  app.get('/users', verifyAuthToken, index);
  app.get('/users/:id', verifyAuthToken, show);
  app.post('/users', create);
  app.delete('/users/:id', verifyAuthToken, destroy);
  app.post('/users/authenticate', authenticate);
};

export default userRoutes;
