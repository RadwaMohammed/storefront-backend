import client from '../../database';

export const resetUsersTable = async (): Promise<void> => {
  try {
    // Connect to the database
    const conn = await client.connect();
    // sql to delete all rows in the table
    const delUsql = 'DELETE FROM users';
    // sql to restart the sequences begin with default 1
    const restartUsql = 'ALTER SEQUENCE users_id_seq RESTART';
    await conn.query(delUsql);
    await conn.query(restartUsql);
    // close the connection
    conn.release();
  } catch (err) {
    throw new Error(`Could not reset the users table. ${err}`);
  }
};

export const resetProductsTable = async (): Promise<void> => {
  try {
    // Connect to the database
    const conn = await client.connect();
    // sql to delete all rows in the table
    const delPsql = 'DELETE FROM products';
    // sql to restart the sequences begin with default 1
    const restartPsql = 'ALTER SEQUENCE products_id_seq RESTART';
    await conn.query(delPsql);
    await conn.query(restartPsql);

    // close the connection
    conn.release();
  } catch (err) {
    throw new Error(`Could not reset the products table. ${err}`);
  }
};
