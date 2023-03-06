import client from '../database';

// The Typescript type for the order model
export type Order = {
  id?: number;
  status: string;
  userId?: number;
};

// The Typescript type for the order from database
type DBorder = {
  id: number;
  status: string;
  user_id: number;
};
// The Typescript type for the product in the order
export type OrderProduct = {
  orderId?: number;
  productId: number;
  quantity?: number;
};
// The Typescript type for the product in the order from database
type DBorderproduct = {
  product_id: number;
  quantity: number;
};
// The Typescript type for the order details
type OrderDetails = {
  orderId: number;
  userId?: number;
  status?: string;
  products: OrderProduct[];
};

export class OrderStore {
  // Get a list of all the items in orders table in the database
  async index(): Promise<Order[]> {
    try {
      const sql = 'SELECT * FROM orders';
      const conn = await client.connect();
      const result = await conn.query(sql);
      conn.release();
      return result.rows.map((order: DBorder): Order => {
        return { id: order.id, status: order.status, userId: order.user_id };
      });
    } catch (err) {
      throw new Error(`Could not get orders. ${err}`);
    }
  }

  // Get an order by it's id
  async show(id: number): Promise<Order> {
    try {
      const sql = 'SELECT * FROM orders WHERE id=($1)';
      const conn = await client.connect();
      const result = await conn.query(sql, [id]);
      conn.release();
      const order = result.rows[0];
      return {
        id: order && order.id,
        status: order && order.status,
        userId: order && order.user_id
      };
    } catch (err) {
      throw new Error(`Could not find order ${id}. ${err}`);
    }
  }

  // Get the order details
  async getOrderDetails(id: number): Promise<OrderDetails> {
    try {
      const order = await this.show(id);
      const sql = `SELECT product_id, quantity FROM order_products WHERE order_id=($1)`;
      const conn = await client.connect();
      const result = await conn.query(sql, [id]);
      conn.release();
      const products = result.rows;
      const orderDetails = {
        orderId: id,
        userId: order && order.userId,
        status: order && order.status,
        products: products.map((product: DBorderproduct): OrderProduct => {
          return {
            productId: product.product_id,
            quantity: product.quantity
          };
        })
      };
      return orderDetails;
    } catch (err) {
      throw new Error(`Could not add get order's details. ${err}`);
    }
  }

  // Create a new order
  async create(order: Order): Promise<Order> {
    try {
      const sql =
        'INSERT INTO orders (status, user_id) VALUES($1, $2) RETURNING *';
      const conn = await client.connect();
      const result = await conn.query(sql, [order.status, order.userId]);
      conn.release();
      const myOrder = result.rows[0];
      return {
        id: myOrder && myOrder.id,
        status: myOrder && myOrder.status,
        userId: myOrder && myOrder.user_id
      };
    } catch (err) {
      throw new Error(`Could not add new oder. ${err}`);
    }
  }

  // Get an order by it's id - update the status of the order
  async update(id: number, status: Order['status']): Promise<Order> {
    try {
      const sql = 'UPDATE orders SET status=($2) WHERE id=($1) RETURNING *';
      const conn = await client.connect();
      const result = await conn.query(sql, [id, status]);
      conn.release();
      const order = result.rows[0];
      return {
        id: order && order.id,
        status: order && order.status,
        userId: order && order.user_id
      };
    } catch (err) {
      throw new Error(`Could not edit the status of order ${id}. ${err}`);
    }
  }

  // Edit quantity of a product in an order
  async updateQuantityProduct(
    id: number,
    productId: number,
    quantity: number
  ): Promise<OrderProduct> {
    try {
      const sql =
        'UPDATE order_products SET quantity=($3) WHERE order_id=($1) AND product_id=($2) RETURNING *';
      const conn = await client.connect();
      const result = await conn.query(sql, [id, productId, quantity]);
      conn.release();
      const orderProduct = result.rows[0];
      return {
        orderId: orderProduct && orderProduct.order_id,
        productId: orderProduct && orderProduct.product_id,
        quantity: orderProduct && orderProduct.quantity
      };
    } catch (err) {
      throw new Error(
        `Could not edit the quantity of product ${productId} in order ${id}. ${err}`
      );
    }
  }

  // Delete an order by it's id
  async delete(id: number): Promise<Order> {
    try {
      // First delete rows of order_products table that has the ordre'id
      const sql1 = 'DELETE FROM order_products WHERE order_id=($1) RETURNING *';
      const conn = await client.connect();
      await conn.query(sql1, [id]);
      conn.release();
    } catch (err) {
      throw new Error(
        `Could not delete the order from ordeer-products table. ${err}`
      );
    }
    try {
      // Delete the order from orders table
      const sql2 = 'DELETE FROM orders WHERE id=($1) RETURNING *';
      const conn = await client.connect();
      const result = await conn.query(sql2, [id]);
      conn.release();
      const deletedOrder = result.rows[0];
      return {
        id: deletedOrder && deletedOrder.id,
        status: deletedOrder && deletedOrder.status,
        userId: deletedOrder && deletedOrder.user_id
      };
    } catch (err) {
      throw new Error(`Could not delete the order ${id}. ${err}`);
    }
  }

  // Add Product to an order
  async addProduct(
    orderId: number,
    productId: number,
    quantity: number
  ): Promise<OrderProduct> {
    try {
      let order: OrderProduct;
      const orderDetail = await this.getOrderDetails(orderId);
      const products = orderDetail.products;
      // get order to see if it is open
      if (orderDetail && orderDetail.status !== 'active') {
        throw new Error(
          `Could not add product ${productId} to order ${orderId} because order status is ${orderDetail.status}`
        );
      }
      // Make sure if the user try to insert product exist already in the order
      if (
        products.find(
          (product: OrderProduct): boolean => product.productId === productId
        )
      ) {
        // Update the product if it is already exist in the order
        order = await this.updateQuantityProduct(orderId, productId, quantity);
      } else {
        const sql =
          'INSERT INTO order_products (quantity, order_id, product_id) VALUES($1, $2, $3) RETURNING *';
        const conn = await client.connect();
        const result = await conn.query(sql, [quantity, orderId, productId]);
        const myOrder = result.rows[0];
        conn.release();
        order = {
          orderId: myOrder && myOrder.order_id,
          productId: myOrder && myOrder.product_id,
          quantity: myOrder && myOrder.quantity
        };
      }

      return order;
    } catch (err) {
      throw new Error(
        `Could not add product ${productId} to order ${orderId}: ${err}`
      );
    }
  }

  // Delete Product from an order
  async deleteProduct(
    orderId: number,
    productId: number
  ): Promise<OrderProduct> {
    try {
      const sql =
        'DELETE FROM order_products WHERE order_id = $1 AND product_id = $2 RETURNING *';
      const conn = await client.connect();
      const result = await conn.query(sql, [orderId, productId]);
      const orderProduct = result.rows[0];
      conn.release();
      return {
        orderId: orderProduct && orderProduct.order_id,
        productId: orderProduct && orderProduct.product_id,
        quantity: orderProduct && orderProduct.quantity
      };
    } catch (err) {
      throw new Error(
        `Could not delete product ${productId} from order ${orderId}. ${err}`
      );
    }
  }

  // Delete All products in an order
  async deleteAllProducts(id: number): Promise<OrderProduct[]> {
    try {
      const sql = 'DELETE FROM order_products WHERE order_id = $1 RETURNING *';
      const conn = await client.connect();
      const result = await conn.query(sql, [id]);
      const products = result.rows[0];
      conn.release();
      return products.map((product: DBorderproduct): OrderProduct => {
        return {
          productId: product.product_id,
          quantity: product.quantity
        };
      });
    } catch (err) {
      throw new Error(
        `Could not delete all products in the order ${id}. ${err}`
      );
    }
  }

  // Get All orders for a user
  async getAllOrders(id: number): Promise<OrderDetails[]> {
    try {
      const sql = 'SELECT * FROM orders WHERE user_id=($1)';
      const conn = await client.connect();
      const result = await conn.query(sql, [id]);
      const orders = result.rows;
      conn.release();

      const allOrders = await Promise.all(
        orders.map(async (order: DBorder): Promise<OrderDetails> => {
          return {
            orderId: order.id,
            status: order.status,
            products: (await this.getOrderDetails(order.id)).products
          };
        })
      );
      return allOrders;
    } catch (err) {
      throw new Error(`Could not get all orders of the user ${id}. ${err}`);
    }
  }

  // Get All Current active orders for a user
  async getActiveOrders(id: number): Promise<OrderDetails[]> {
    try {
      const sql = `SELECT * FROM orders WHERE user_id= $1 AND status = 'active'`;
      const conn = await client.connect();
      const result = await conn.query(sql, [id]);
      const orders = result.rows;
      conn.release();

      const allOrders = await Promise.all(
        orders.map(async (order: DBorder) => {
          return {
            orderId: order.id,
            status: order.status,
            products: (await this.getOrderDetails(order.id)).products
          };
        })
      );
      return allOrders;
    } catch (err) {
      throw new Error(`Could not get all orders of the user ${id}. ${err}`);
    }
  }

  // Get All Completed orders for a user
  async getCompleteOrders(id: number): Promise<OrderDetails[]> {
    try {
      const sql = `SELECT * FROM orders WHERE user_id= $1 AND status = 'complete'`;
      const conn = await client.connect();
      const result = await conn.query(sql, [id]);
      const orders = result.rows;
      conn.release();

      const allOrders = await Promise.all(
        orders.map(async (order: DBorder) => {
          return {
            orderId: order.id,
            status: order.status,
            products: (await this.getOrderDetails(order.id)).products
          };
        })
      );
      return allOrders;
    } catch (err) {
      throw new Error(`Could not get all orders of the user ${id}. ${err}`);
    }
  }

  // Delete All Current active orders for a user
  async deletActiveOrders(id: number): Promise<Order[]> {
    try {
      const allActiveOrder = await this.getActiveOrders(id);
      return await Promise.all(
        allActiveOrder.map(
          async (order: OrderDetails): Promise<Order> =>
            await this.delete(order.orderId)
        )
      );
    } catch (err) {
      throw new Error(
        `Could not delete all active orders of the user ${id}. ${err}`
      );
    }
  }

  // Delete All complete orders for a user
  async deletCompleteOrders(id: number): Promise<Order[]> {
    try {
      const allCompleteOrder = await this.getCompleteOrders(id);
      return await Promise.all(
        allCompleteOrder.map(
          async (order: OrderDetails): Promise<Order> =>
            await this.delete(order.orderId)
        )
      );
    } catch (err) {
      throw new Error(
        `Could not delete all completes orders of the user ${id}. ${err}`
      );
    }
  }

  // Delete All complete orders for a user
  async deletAllOrders(id: number): Promise<Order[]> {
    try {
      const orders = await this.getAllOrders(id);
      return await Promise.all(
        orders.map(
          async (order: OrderDetails): Promise<Order> =>
            await this.delete(order.orderId)
        )
      );
    } catch (err) {
      throw new Error(`Could not delete all orders of the user ${id}. ${err}`);
    }
  }
}
