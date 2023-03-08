import client from '../database';

export const resetUsersTable = async (): Promise<void> => {
  try {
    // Connect to the database
    const conn = await client.connect();
    // sql to delete all rows in the table
    const delUsers = 'DELETE FROM users';
    // sql to restart the sequences begin with default 1
    const restartSequence = 'ALTER SEQUENCE users_id_seq RESTART';
    await conn.query(delUsers);
    await conn.query(restartSequence);
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
    const delProducts = 'DELETE FROM products';
    // sql to restart the sequences begin with default 1
    const restartSequence = 'ALTER SEQUENCE products_id_seq RESTART';
    await conn.query(delProducts);
    await conn.query(restartSequence);

    // close the connection
    conn.release();
  } catch (err) {
    throw new Error(`Could not reset the products table. ${err}`);
  }
};

export const resetOrdersTable = async (): Promise<void> => {
  try {
    // Connect to the database
    const conn = await client.connect();
    // sql to delete all rows in the table
    const delOrders = 'DELETE FROM orders';
    // sql to restart the sequences begin with default 1
    const restartSequence = 'ALTER SEQUENCE orders_id_seq RESTART';
    await conn.query(delOrders);
    await conn.query(restartSequence);

    // close the connection
    conn.release();
  } catch (err) {
    throw new Error(`Could not reset the orders table. ${err}`);
  }
};

export const resetOrderProductsTable = async (): Promise<void> => {
  try {
    // Connect to the database
    const conn = await client.connect();
    // sql to delete all rows in the table
    const delOrderProducts = 'DELETE FROM order_products';
    // sql to restart the sequences begin with default 1
    const restartSequence = 'ALTER SEQUENCE order_products_id_seq RESTART';
    await conn.query(delOrderProducts);
    await conn.query(restartSequence);

    // close the connection
    conn.release();
  } catch (err) {
    throw new Error(`Could not reset the order_products table. ${err}`);
  }
};

export const resetAllTables = async (): Promise<void> => {
  try {
    await resetOrderProductsTable();
    await resetProductsTable();
    await resetOrdersTable();
    await resetUsersTable();
  } catch (err) {
    throw new Error(`Could not reset all the tables. ${err}`);
  }
};
