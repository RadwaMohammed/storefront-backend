import client from '../database';

// The Typescript type for the product model
export type Product = {
  id?: number;
  name: string;
  category?: string;
  price: number;
  description?: string;
};
// The Typescript type for the product to be update
// Make its properties optional as the user may not need to update all the keys
export type ProductUpdate = {
  name?: string;
  category?: string;
  price?: number;
  description?: string;
};

export class ProductStore {
  // Get a list of all the items in products table in the database
  async index(): Promise<Product[]> {
    try {
      const conn = await client.connect();
      const sql = 'SELECT * FROM products';
      const result = await conn.query(sql);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(`Could not get the products. ${err}`);
    }
  }

  // Get list of products by category
  async productsByCategory(category: string): Promise<Product[]> {
    try {
      const sql = 'SELECT * FROM products WHERE category=($1)';
      const conn = await client.connect();
      const result = await conn.query(sql, [category]);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(`Could not get the products. ${err}`);
    }
  }

  // Get a product by it's id
  async show(id: number): Promise<Product> {
    try {
      const sql = 'SELECT * FROM products WHERE id=($1)';
      const conn = await client.connect();
      const result = await conn.query(sql, [id]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not get the product. ${err}`);
    }
  }
  // Create a new product
  async create(product: Product): Promise<Product> {
    try {
      // The properties of the product
      const cols = Object.keys(product)
        .map((key: string): string => `${key}`)
        .join(', ');
      const colsVal = Object.keys(product)
        .map((_: string, i: number): string => `$${i + 1}`)
        .join(', ');
      // The values of the product properties
      const values = Object.values(product);
      const sql = `INSERT INTO products (${cols}) VALUES(${colsVal}) RETURNING *`;
      const conn = await client.connect();
      const result = await conn.query(sql, values);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not add ${product.name} product. ${err}`);
    }
  }
  // Delete a product by it's id
  async delete(id: number): Promise<Product> {
    try {
      const sql = 'DELETE FROM products WHERE id=($1) RETURNING *';
      const conn = await client.connect();
      const result = await conn.query(sql, [id]);
      const deletedProduct = result.rows[0];
      conn.release();
      return deletedProduct;
    } catch (err) {
      throw new Error(`Could not delete the product. ${err}`);
    }
  }
  // Update a product
  async update(id: number, product: ProductUpdate): Promise<Product> {
    try {
      // The properties of the product to be update
      const data = Object.keys(product)
        .map((key: string, i: number): string => `${key} = $${i + 2}`)
        .join(', ');
      // The values of the product properties
      const values = Object.values(product);
      const sql = `UPDATE products SET ${data} WHERE id = $1 RETURNING *`;
      const conn = await client.connect();
      const result = await conn.query(sql, [id, ...values]);
      const updatedProduct = result.rows[0];
      conn.release();
      return updatedProduct;
    } catch (err) {
      throw new Error(`Could not update the product. ${err}`);
    }
  }
}
