import express, { Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { User, UserUpdate, UserStore } from '../models/user';
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
    const id = _req.params.id.trim();
    // Check if the id is valid
    const isIdValid = +id > 0 && !Number.isNaN(+id);
    if (!isIdValid) {
      res.status(400);
      res.json('Invalid user id. Please provide a valid id.');
    } else {
      const user = await store.show(+id);
      res.status(user.id ? 200 : 404);
      res.json(user.id ? user : `User with id ${id} not found.`);
    }
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
      firstName: req.body.first_name && `${req.body.first_name}`.trim(),
      lastName: req.body.last_name && `${req.body.last_name}`.trim(),
      username: req.body.username && `${req.body.username}`.trim(),
      password: req.body.password && `${req.body.password}`.trim(),
      email: req.body.email && `${req.body.email}`.trim()
    };
    // A type represents all the property names for user object
    type UserKeyType = keyof typeof user;
    // Find if there is a property with no value
    const noValue = Object.keys(user).find(
      (key: string): boolean =>
        user[key as UserKeyType] === undefined ||
        user[key as UserKeyType] === ''
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

// Handler function for the update route
const update = async (req: Request, res: Response): Promise<void> => {
  try {
    // The requested user to be updated
    const user: UserUpdate = {
      firstName: req.body.first_name && `${req.body.first_name}`.trim(),
      lastName: req.body.last_name && `${req.body.last_name}`.trim(),
      password: req.body.password && `${req.body.password}`.trim(),
      email: req.body.email && `${req.body.email}`.trim()
    };
    // The requesrted user id
    const id = req.params.id.trim();
    // Check if the id is valid
    const isIdValid = +id > 0 && !Number.isNaN(+id);
    // Get the user
    const myUser = await store.show(+id);
    // A type represents all the property names for user object
    type UserKeyType = keyof typeof user;
    /**
     * The user may not want to modify all properties
     * so if the user didn't provide any of them will be acceptable
     */
    Object.keys(user).forEach(
      (key: string): boolean =>
        user[key as UserKeyType] === undefined &&
        delete user[key as UserKeyType]
    );

    // Find if there is a key with no value
    const noValue = Object.keys(user).find(
      (key: string): boolean => !user[key as UserKeyType]
    );
    // Check te user id
    if (!isIdValid) {
      res.status(400);
      res.json('Invalid user id. Please provide a valid id.');
    }
    // First check if the user exist
    else if (!myUser.id) {
      res.status(404);
      res.json(`User with id ${id} not found to be update.`);
    }
    // Check if the user request update username it's not allowed
    else if (
      req.body.username &&
      req.body.username.trim() !== myUser.username
    ) {
      res.status(405);
      res.json(`It's not allowed to edit the username.`);
    }
    // As the default value for description is empty
    // so if the user didn't provide a value will be acceptable to be updated to empty
    else if (noValue) {
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
      const updateduser = await store.update(+id, user);
      res.status(200);
      res.json(updateduser);
    }
  } catch (err) {
    res.status(400);
    res.json(`An error occured couldn't update the user. ${err}`);
  }
};

// Handler function for the delete route
const destroy = async (_req: Request, res: Response) => {
  try {
    const id = _req.params.id.trim();
    // Check if the id is valid
    const isIdValid = +id > 0 && !Number.isNaN(+id);
    if (!isIdValid) {
      res.status(400);
      res.json('Invalid user id. Please provide a valid id.');
    } else {
      const deletedUser = await store.delete(+id);
      res.status(deletedUser.id ? 200 : 404);
      res.json(
        deletedUser.id
          ? deletedUser
          : `User with id ${id} not found to be delete.`
      );
    }
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
      username: req.body.username && req.body.username.trim(),
      password: req.body.password && req.body.password.trim()
    };
    // A type represents all the property names for user object
    type UserKeyType = keyof typeof user;
    const noValue = Object.keys(user).find(
      (key: string): boolean => !user[key as UserKeyType]
    );
    if (noValue) {
      res.status(400);
      res.json(`Please provide a value to the ${noValue}.`);
    } else {
      const u = await store.authenticate(user.username, user.password);
      const token = jwt.sign({ user: u }, process.env.TOKEN_SECRET as Secret);
      res.status(u ? 200 : 404);
      res.json(u ? token : `User with username ${user.username} not found.`);
    }
  } catch (err) {
    res.status(401);
    res.json(`An error occured. ${err}`);
  }
};

const userRoutes = (app: express.Application) => {
  app.get('/users', verifyAuthToken, index);
  app.get('/users/:id', verifyAuthToken, show);
  app.post('/users', create);
  app.put('/users/:id', verifyAuthToken, update);
  app.delete('/users/:id', verifyAuthToken, destroy);
  app.post('/users/authenticate', authenticate);
};

export default userRoutes;
