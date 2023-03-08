import { OrderStore } from '../../models/order';
import { resetAllTables } from '../../utils/reset';
import { UserStore } from '../../models/user';
import { ProductStore } from './../../models/product';
import { OrderProduct } from '../../utils/types';

const store = new OrderStore();
const userStore = new UserStore();
const productStore = new ProductStore();

describe('Order Model', (): void => {
  // Before any tests reset the table
  beforeAll(async (): Promise<void> => {
    await resetAllTables();
    // Create a user for tests
    await userStore.create({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john_doe',
      password: 'pass@store123',
      email: 'mail2johndoe@gmail.com'
    });
    // Create a product for tests
    await productStore.create({
      id: 1,
      name: 'Skipping Jump Rope',
      category: 'Sporting Goods',
      price: '20',
      description:
        'This skipping rope is made of high-quality material and does not break easily.'
    });
    await productStore.create({
      id: 2,
      name: 'Batteries',
      category: 'Electronics',
      price: '50'
    });
  });

  // After all the tests
  afterAll(async (): Promise<void> => {
    //  Reset the tables
    await resetAllTables();
  });

  // Tests order model
  it('should have an index method', (): void => {
    expect(store.index).toBeDefined();
  });

  it('should have an indexDetails method', (): void => {
    expect(store.indexDetails).toBeDefined();
  });

  it('should have a show method', (): void => {
    expect(store.show).toBeDefined();
  });

  it('should have a create method', (): void => {
    expect(store.create).toBeDefined();
  });

  it('should have an updateStatus method', (): void => {
    expect(store.updateStatus).toBeDefined();
  });

  it('should have a delete method', (): void => {
    expect(store.delete).toBeDefined();
  });

  it('should have a addProducts method', (): void => {
    expect(store.addProduct).toBeDefined();
  });

  it('should have a getOrderDetails method', (): void => {
    expect(store.getOrderDetails).toBeDefined();
  });

  it('should have a updateQuantityProduct method', (): void => {
    expect(store.updateQuantityProduct).toBeDefined();
  });

  it('should have a deleteProduct method', (): void => {
    expect(store.deleteProduct).toBeDefined();
  });

  it('should have a getAllOrders method', (): void => {
    expect(store.getAllOrders).toBeDefined();
  });

  it('should have a getActiveOrders method', (): void => {
    expect(store.getActiveOrders).toBeDefined();
  });

  it('should have a getCompleteOrders method', (): void => {
    expect(store.getCompleteOrders).toBeDefined();
  });
  it('should have a getOrderProducts method', (): void => {
    expect(store.getOrderProducts).toBeDefined();
  });

  it('create method should add an order', async (): Promise<void> => {
    const result = await store.create({
      id: 1,
      status: 'active',
      userId: 1
    });
    expect(result).toEqual({
      id: 1,
      status: 'active',
      userId: 1
    });
  });

  it('addProduct method should add a product to an order', async (): Promise<void> => {
    const product = {
      productId: 1,
      quantity: 2
    };
    const result = await store.addProduct(1, product);
    expect(result).toEqual({
      orderId: 1,
      productId: 1,
      quantity: 2
    });
  });

  it('addProduct method should update quantity if user try to add a product already exist in the order', async (): Promise<void> => {
    const result = await store.addProduct(1, {
      orderId: 1,
      productId: 1,
      quantity: 5
    });
    expect(result).toEqual({
      orderId: 1,
      productId: 1,
      quantity: 5
    });
  });

  it('index method should return a list of orders', async (): Promise<void> => {
    const result = await store.index();
    expect(result).toEqual([
      {
        id: 1,
        status: 'active',
        userId: 1
      }
    ]);
  });

  it('show method should return the correct order', async (): Promise<void> => {
    const result = await store.show(1);
    expect(result).toEqual({
      id: 1,
      status: 'active',
      userId: 1
    });
  });

  it('getOrderDetails method should return the correct order with products', async (): Promise<void> => {
    const result = await store.getOrderDetails(1);
    expect(result).toEqual({
      orderId: 1,
      userId: 1,
      status: 'active',
      products: [
        {
          productId: 1,
          quantity: 5
        }
      ]
    });
  });

  it('getOrderProducts method should return the products of the order', async (): Promise<void> => {
    const result = await store.getOrderProducts(1);
    expect(result).toEqual([
      {
        productId: 1,
        quantity: 5
      }
    ]);
  });

  it('indexDetails method should return a list of order with products', async (): Promise<void> => {
    const result = await store.indexDetails();
    expect(result).toEqual([
      {
        orderId: 1,
        userId: 1,
        status: 'active',
        products: [
          {
            productId: 1,
            quantity: 5
          }
        ]
      }
    ]);
  });

  it('updateStatus method should update the status of the order', async (): Promise<void> => {
    const edits = 'complete';
    const result = await store.updateStatus(1, edits);
    expect(result.status).toEqual(edits);
  });

  it('updateQuantityProduct method should update the quantity of a product in an order', async (): Promise<void> => {
    const edits = {
      productId: 1,
      quantity: 3
    };
    const result = await store.updateQuantityProduct(1, edits);
    expect(result.quantity).toEqual(edits.quantity);
  });

  it('getAllOrders method should get all orders of a user', async (): Promise<void> => {
    // Add some orders and products for tests
    await store.create({
      id: 2,
      status: 'complete',
      userId: 1
    });
    await store.create({
      id: 3,
      status: 'active',
      userId: 1
    });
    await store.create({
      id: 4,
      status: 'active',
      userId: 1
    });
    await store.addProduct(3, { productId: 1, quantity: 5 });
    await store.addProduct(3, { productId: 1, quantity: 2 });
    await store.addProduct(3, { productId: 2, quantity: 2 });
    await store.addProduct(4, { productId: 1, quantity: 8 });
    const result = await store.getAllOrders(1);
    expect(result).toEqual([
      {
        orderId: 1,
        status: 'complete',
        products: [
          {
            productId: 1,
            quantity: 3
          }
        ]
      },
      {
        orderId: 2,
        status: 'complete',
        products: []
      },
      {
        orderId: 3,
        status: 'active',
        products: [
          {
            productId: 1,
            quantity: 2
          },
          {
            productId: 2,
            quantity: 2
          }
        ]
      },
      {
        orderId: 4,
        status: 'active',
        products: [
          {
            productId: 1,
            quantity: 8
          }
        ]
      }
    ]);
  });

  it('getActiveOrders method should get all active orders of a user', async (): Promise<void> => {
    const result = await store.getActiveOrders(1);
    expect(result).toEqual([
      {
        orderId: 3,
        status: 'active',
        products: [
          {
            productId: 1,
            quantity: 2
          },
          {
            productId: 2,
            quantity: 2
          }
        ]
      },
      {
        orderId: 4,
        status: 'active',
        products: [
          {
            productId: 1,
            quantity: 8
          }
        ]
      }
    ]);
  });

  it('getCompleteOrders method should get all completed orders of a user', async (): Promise<void> => {
    const result = await store.getCompleteOrders(1);
    expect(result).toEqual([
      {
        orderId: 1,
        status: 'complete',
        products: [
          {
            productId: 1,
            quantity: 3
          }
        ]
      },
      {
        orderId: 2,
        status: 'complete',
        products: []
      }
    ]);
  });

  it('deleteProduct method should delete product from the order', async (): Promise<void> => {
    await store.deleteProduct(1, 1);
    const order = await store.getOrderDetails(1);
    const product = order.products.find(
      (product: OrderProduct): boolean => product.productId === 1
    );
    expect(product).toBeUndefined;
  });

  it('delete method should remove the order', async (): Promise<void> => {
    await store.delete(1);
    const order = await store.show(1);
    expect(order).toBeUndefined;
  });

  it('deletActiveOrders method should delete product from the order', async (): Promise<void> => {
    await store.deleteActiveOrders(1);
    const orders = await store.getActiveOrders(1);
    expect(orders).toEqual([]);
  });

  it('deletCompleteOrders method should delete product from the order', async (): Promise<void> => {
    await store.deleteCompleteOrders(1);
    const orders = await store.getCompleteOrders(1);
    expect(orders).toEqual([]);
  });

  it('deletAllOrders method should delete all orders of a user', async (): Promise<void> => {
    // Add some order for tests
    await store.create({
      status: 'complete',
      userId: 1
    });
    await store.create({
      status: 'active',
      userId: 1
    });
    await store.create({
      status: 'active',
      userId: 1
    });
    await store.deleteAllOrders(1);
    const orders = await store.getAllOrders(1);
    expect(orders).toEqual([]);
  });
});
