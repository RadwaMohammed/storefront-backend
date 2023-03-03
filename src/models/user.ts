import bcrypt from 'bcrypt';
import client from '../database';

const saltRounds = process.env.SALT_ROUNDS;
const pepper = process.env.BCRYPT_PASSWORD;
// The Typescript type for the user model
export type User = {
  id?: number;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
};
// The Typescript type for the user to be update
// Make its properties optional as the user may not nee to update all the keys
export type UserUpdate = {
  firstName?: string;
  lastName?: string;
  password?: string;
  email?: string;
};
// The Typescript type for the user from database
type DBuser = {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  password_digest: string;
  email: string;
};

// DB error type
interface DBerrorException extends Error {
  code?: string | undefined;
  constraint?: string | undefined;
  detail?: string | undefined;
}

export class UserStore {
  // Get a list of all the items in users table in the database
  async index(): Promise<User[]> {
    try {
      const conn = await client.connect();
      const sql = 'SELECT * FROM users';
      const result = await conn.query(sql);
      conn.release();
      return result.rows.map((user: DBuser): User => {
        return {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          password: user.password_digest,
          email: user.email
        };
      });
    } catch (err) {
      throw new Error(`Could not get users. ${err}`);
    }
  }

  // Get a user by id
  async show(id: number): Promise<User> {
    try {
      const sql = 'SELECT * FROM users WHERE id=($1)';
      const conn = await client.connect();
      const result = await conn.query(sql, [id]);
      conn.release();
      const user = result.rows[0];
      return {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        password: user.password_digest,
        email: user.email
      };
    } catch (err) {
      throw new Error(`Could not find user ${id}. ${err}`);
    }
  }

  // Create a new user
  async create(u: User): Promise<User> {
    try {
      const conn = await client.connect();
      const sql =
        'INSERT INTO users (first_name, last_name, username, password_digest, email) VALUES($1, $2, $3, $4, $5) RETURNING *';
      // Hashing the password from the user by using bcrypt hashing method with salt and pepper
      const hash = bcrypt.hashSync(
        u.password + pepper,
        parseInt(saltRounds as string)
      );
      const result = await conn.query(sql, [
        u.firstName,
        u.lastName,
        u.username,
        hash,
        u.email
      ]);
      const user = result.rows[0];
      conn.release();
      return {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        password: user.password_digest,
        email: user.email
      };
    } catch (err) {
      // Check if error occur due to unique constraint violation
      if (
        (err as DBerrorException)['code'] &&
        (err as DBerrorException)['code'] === '23505'
      ) {
        throw new Error(`${(err as DBerrorException)['detail']}`);
      } else {
        throw new Error(`Could not create the user. ${err}`);
      }
    }
  }

  // Update a user
  async update(id: number, user: UserUpdate): Promise<User> {
    try {
      // The properties of the user to be update
      const userKeys = Object.keys(user).map((key: string): string =>
        key === 'firstName'
          ? 'first_name'
          : key === 'lastName'
          ? 'last_name'
          : key === 'password'
          ? 'password_digest'
          : key
      );
      const data = userKeys
        .map((key: string, i: number): string => `${key} = $${i + 2}`)
        .join(', ');

      // Check if there is  a request to update the password
      if (user.password) {
        // Hashing the password from the user by using bcrypt hashing method with salt and pepper
        const hash = bcrypt.hashSync(
          user.password + pepper,
          parseInt(saltRounds as string)
        );
        user.password = hash;
      }
      // The values of the user properties
      const values = Object.values(user);
      const sql = `UPDATE users SET ${data} WHERE id = $1 RETURNING *`;
      const conn = await client.connect();
      const result = await conn.query(sql, [id, ...values]);
      const updatedUser = result.rows[0];
      conn.release();
      return {
        id: updatedUser.id,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        username: updatedUser.username,
        password: updatedUser.password_digest,
        email: updatedUser.email
      };
    } catch (err) {
      // Check if error occur due to unique constraint violation
      if (
        (err as DBerrorException)['code'] &&
        (err as DBerrorException)['code'] === '23505'
      ) {
        throw new Error(`${(err as DBerrorException)['detail']}`);
      } else {
        throw new Error(`Could not update the user. ${err}`);
      }
    }
  }

  // Delete a user by id
  async delete(id: number): Promise<User> {
    try {
      const conn = await client.connect();
      const sql = 'DELETE FROM users WHERE id=($1) RETURNING *';
      const result = await conn.query(sql, [id]);
      const deletedUser = result.rows[0];
      conn.release();
      return {
        id: deletedUser.id,
        firstName: deletedUser.first_name,
        lastName: deletedUser.last_name,
        username: deletedUser.username,
        password: deletedUser.password_digest,
        email: deletedUser.email
      };
    } catch (err) {
      throw new Error(`Could not delete the user. ${err}`);
    }
  }
  // Validating passwords at user sign in
  async authenticate(username: string, password: string): Promise<User | null> {
    try {
      const conn = await client.connect();
      const sql = 'SELECT * FROM users WHERE username=($1)';
      const result = await conn.query(sql, [username]);
      // Check if the user exists with the requested username
      if (result.rows.length) {
        const user = result.rows[0];
        // Checks an incoming password concatenated with pepper against the hashed password stored in the database
        if (bcrypt.compareSync(password + pepper, user.password_digest)) {
          return {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username,
            password: user.password_digest,
            email: user.email
          };
        } else {
          throw new Error(`Wrong Password`);
        }
      }
      // Return null if there is no user with the requested username
      return null;
    } catch (err) {
      throw new Error(`Could not validate the user. ${err}`);
    }
  }
}
