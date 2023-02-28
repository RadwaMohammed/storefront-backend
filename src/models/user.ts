import client from '../database';

// The Typescript type for the user model
export type User = {
  id?: number;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
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

export class UserStore {
  // Get a list of all the items in users table in the database
  async index(): Promise<User[]> {
    try {
      const conn = await client.connect();
      const sql = 'SELECT * FROM users';
      const result = await conn.query(sql);
      conn.release();
      return result.rows.map((user: DBuser) : User => {
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
      throw new Error(`Could not get users. Error: ${err}`);
    } 
  }
  // Get a user by id
  async show(id: string): Promise<User> {
    try {
      const sql = 'SELECT * FROM users WHERE id=($1)';
      const conn = await client.connect();
      const result = await conn.query(sql, [id]);
      conn.release();
      const user =  result.rows[0];
      return {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        password: user.password_digest,
        email: user.email
      };
    } catch (err) {
      throw new Error(`Could not find user ${id}. Error: ${err}`);
    }
  }
  // Create a new user
  async create(u: User): Promise<User> {
    try {
      const conn = await client.connect();
      const sql = 'INSERT INTO users (first_name, last_name, username, password_digest, email) VALUES($1, $2, $3, $4, $5) RETURNING *';
      const result = await conn.query(sql, [u.firstName, u.lastName, u.username, u.password, u.email]);
      console.log(result);
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
    } catch(err) {
      throw new Error(`Could not create the user. Error: ${err}`);
    } 
  }
  // Delete a user by id
  async delete(id: string): Promise<User> {
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
    } catch(err) {
      throw new Error(`Could not delete the user. Error: ${err}`);
    }
  }

}
