import express, { Request, Response } from 'express';
import { Order, OrderProduct, OrderStore } from '../models/order';
import verifyAuthToken from '../middlewares/auth';
import { UserStore } from './../models/user';
import { ProductStore } from './../models/product';

const store = new OrderStore();
const userStore = new UserStore();
const productStore = new ProductStore();

// Handler function for the index </orders> route
const index = async (_req: Request, res: Response): Promise<void> => {
  try {
    const orders = await store.index();
    res.status(200);
    res.json(orders);
  } catch (err) {
    res.status(422);
    res.json(`An error occured. ${err}`);
  }
};

// Handler function for the show </orders/:id> route
const show = async (_req: Request, res: Response): Promise<void> => {
  try {
    const id = _req.params.id.trim();
    // Check if the id is valid
    const isIdValid = +id > 0 && !Number.isNaN(+id);
    if (!isIdValid) {
      res.status(400);
      res.json('Invalid order id. Please provide a valid id.');
    } else {
      const order = await store.show(+id);
      res.status(order.id ? 200 : 404);
      res.json(order.id ? order : `Order with id ${id} not found.`);
    }
  } catch (err) {
    res.status(422);
    res.json(`An error occured. ${err}`);
  }
};

// Handler function for the </orders/:id/order-details> route
const getOrderDetails = async (_req: Request, res: Response): Promise<void> => {
  try {
    const id = _req.params.id.trim();
    // Check if the id is valid
    const isIdValid = +id > 0 && !Number.isNaN(+id);
    if (!isIdValid) {
      res.status(400);
      res.json('Invalid order id. Please provide a valid id.');
    } else {
      const order = await store.getOrderDetails(+id);
      res.status(order.orderId ? 200 : 404);
      res.json(order.orderId ? order : `Order with id ${id} not found.`);
    }
  } catch (err) {
    res.status(422);
    res.json(`An error occured. ${err}`);
  }
};

// Handler function for the </orders/:id/products> route
const getOrderProducts = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = _req.params.id.trim();
    // Check if the id is valid
    const isIdValid = +id > 0 && !Number.isNaN(+id);
    if (!isIdValid) {
      res.status(400);
      res.json('Invalid order id. Please provide a valid id.');
    } else {
      const products = await store.getOrderProducts(+id);
      res.status(200);
      res.json(products);
    }
  } catch (err) {
    res.status(422);
    res.json(`An error occured. ${err}`);
  }
};

// Handler function for the orders-details </orders/order-details> route
const indexDetails = async (_req: Request, res: Response): Promise<void> => {
  try {
    const orders = await store.indexDetails();
    res.status(200);
    res.json(orders);
  } catch (err) {
    res.status(422);
    res.json(`An error occured. ${err}`);
  }
};

// Handler function for the create </orders> route
const create = async (req: Request, res: Response): Promise<void> => {
  try {
    // The reduested order parts
    const myReqStatus = req.body.status && `${req.body.status}`.trim();
    const myReqUserId = req.body.user_id && `${req.body.user_id}`.trim();
    // The requested order to be created
    const order: Order = {
      status: myReqStatus,
      userId: +myReqUserId
    };

    // Check if the userId valid
    const isUserIdValid = order.userId > 0 && !Number.isNaN(order.userId);
    const orderUser = isUserIdValid && (await userStore.show(order.userId));
    if (
      myReqStatus === undefined ||
      myReqUserId === undefined ||
      myReqStatus === '' ||
      myReqUserId === ''
    ) {
      res.status(400);
      res.json(
        `Please provide a value to the ${
          myReqStatus ? 'user_id' : 'status'
        }, It can't be empty.`
      );
    } else if (!isUserIdValid) {
      res.status(400);
      res.json('Invalid user_id.');
    } else if (!(orderUser || {}).id) {
      res.status(404);
      res.json(`There is no a user has id ${order.userId} is found.`);
    } else {
      const newProduct = await store.create(order);
      res.status(200);
      res.json(newProduct);
    }
  } catch (err) {
    res.status(422);
    res.json(`An error occured couldn't create a new order. ${err}`);
  }
};

// // Handler function for the update </orders/:id> route
const updateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    // The requested order's status to be updated
    const status = req.body.status && `${req.body.status}`.trim();
    // The requesrted order id
    const id = req.params.id.trim();
    // Check if the id is valid
    const isIdValid = +id > 0 && !Number.isNaN(+id);
    const order = isIdValid && (await store.show(+id));
    if (!isIdValid) {
      res.status(400);
      res.json('Invalid order id. Please provide a valid id.');
    } else if (!(order || {}).id) {
      res.status(404);
      res.json(`The is no an order with ${id} id is found.`);
    } else if (!status) {
      res.status(400);
      res.json(
        `Please provide a value to the status <'active' or 'complete'>. It can't be empty.`
      );
    } else {
      const updatedOrder = await store.updateStatus(+id, status);
      res.status(200);
      res.json(updatedOrder);
    }
  } catch (err) {
    res.status(422);
    res.json(
      `An error occured couldn't update the status of the order. ${err}`
    );
  }
};

// Handler Function for the add_product </orders/:id/order-products> route
const addProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const reqOrderId = req.params.id && `${req.params.id}`.trim();
    const reqProductId =
      req.body['product_id'] && `${req.body['product_id']}`.trim();
    const reqQuantity = req.body.quantity && `${req.body.quantity}`.trim();
    // The requested product to be added
    const product: OrderProduct = {
      orderId: +reqOrderId,
      productId: +reqProductId,
      quantity: +reqQuantity
    };

    // Check if the values of request are valid
    const isOrderIdValid = +reqOrderId > 0 && !Number.isNaN(+reqOrderId);
    const isProductIdValid = +reqProductId > 0 && !Number.isNaN(+reqProductId);
    const isQuantityValid = +reqQuantity > 0 && !Number.isNaN(+reqQuantity);

    // Get the product
    const myProduct =
      isProductIdValid && (await productStore.show(product.productId));
    // Get the order
    const myOrder =
      isOrderIdValid && (await store.getOrderDetails(+reqOrderId));

    // make sure if the product already exist
    const orderProducts = myOrder && myOrder.products;
    const reqProduct =
      orderProducts &&
      orderProducts.find(
        (p: OrderProduct): boolean => p.productId === product.productId
      );
    let myQuantity: number;
    // Check if order-id is valid
    if (!isOrderIdValid) {
      res.status(400);
      res.json('Invalid order id. Please provide a valid id.');
    } // Check if the order exist
    else if (!(myOrder || {}).orderId) {
      res.status(404);
      res.json(`The is no an order with ${reqOrderId} id is found.`);
    } // Check if product'id not empty
    else if (reqProductId === undefined || reqProductId === '') {
      res.status(400);
      res.json(
        `Please provide a value to the 'product_id', It can't be empty.`
      );
    } // Check if the product_id valid
    else if (!isProductIdValid) {
      res.status(400);
      res.json(`Invalid 'product_id'. Please provide a valid id.`);
    } // Check if the product exist
    else if (!(myProduct || {}).id) {
      res.status(404);
      res.json(`There is no product has id ${reqProductId} is found.`);
    } // Check if the quantity valid
    else if (reqQuantity) {
      if (!isQuantityValid) {
        res.status(400);
        res.json(`Invalid quantity. It should be positve number.`);
      } else {
        if (reqProduct) {
          //Sum its request quantity and product.quntity
          myQuantity = +reqQuantity + (reqProduct.quantity || 0);
        } else {
          myQuantity = +reqQuantity;
        }
        product.quantity = myQuantity;
        // Add the product
        const myOrderProduct = await store.addProduct(+reqOrderId, product);
        res.status(200);
        res.json(myOrderProduct);
      }
    } else {
      /**
       * If the user didn't provide a quantity the default is 1
       * make sure if the product already exist increment its quantity by 1
       */
      if (reqProduct) {
        myQuantity = (reqProduct.quantity || 0) + 1;
      } else {
        myQuantity = 1;
      }
      product.quantity = myQuantity;
      const myOrderProduct = await store.addProduct(+reqOrderId, product);
      res.status(200);
      res.json(myOrderProduct);
    }
  } catch (err) {
    res.status(422);
    res.json(`An error occured. ${err}`);
  }
};

// Handler function for the update </orders/:id/products/:product> route
const updateQuantityProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const reqOrderId = req.params.id && `${req.params.id}`.trim();
    const reqProductId = req.params.product && `${req.params.product}`.trim();
    const reqQuantity = req.body.quantity && `${req.body.quantity}`.trim();
    // The requested product to be updated
    const product: OrderProduct = {
      orderId: +reqOrderId,
      productId: +reqProductId,
      quantity: +reqQuantity
    };
    // Check if the values of request are valid
    const isOrderIdValid = +reqOrderId > 0 && !Number.isNaN(+reqOrderId);
    const isProductIdValid = +reqProductId > 0 && !Number.isNaN(+reqProductId);
    const isQuantityValid = +reqQuantity > 0 && !Number.isNaN(+reqQuantity);
    // Get the order
    const myOrder =
      isOrderIdValid && (await store.getOrderDetails(+reqOrderId));

    // make sure if the product already exist
    const orderProducts = myOrder && myOrder.products;
    const reqProduct =
      orderProducts &&
      orderProducts.find(
        (p: OrderProduct): boolean => p.productId === product.productId
      );

    // Check if order-id is valid
    if (!isOrderIdValid) {
      res.status(400);
      res.json('Invalid order id. Please provide a valid id.');
    } // Check if the order exist
    else if (!(myOrder || {}).orderId) {
      res.status(404);
      res.json(`The is no an order with ${reqOrderId} id is found.`);
    } // Check if product'id not empty
    else if (reqProductId === undefined || reqProductId === '') {
      res.status(400);
      res.json(`Please provide a value to the 'product's id'.`);
    } // Check if the product_id valid
    else if (!isProductIdValid) {
      res.status(400);
      res.json(`Invalid 'product_id'. Please provide a valid id.`);
    } // Check if the product exist
    else if (!reqProduct) {
      res.status(404);
      res.json(
        `There is no product has id ${reqProductId} is found in the order's id ${reqOrderId}.`
      );
    } // Check if the quantity valid
    else if (reqQuantity === undefined || reqQuantity === '') {
      res.status(400);
      res.json(
        `Please provide a value to the 'quantity', It can't be updated to be empty.`
      );
    } else if (!isQuantityValid) {
      res.status(400);
      res.json(`Invalid quantity. It should be positve number.`);
    } else {
      const myOrderProduct = await store.updateQuantityProduct(
        +reqOrderId,
        product
      );
      res.status(200);
      res.json(myOrderProduct);
    }
  } catch (err) {
    res.status(422);
    res.json(`An error occured. ${err}`);
  }
};

// Handler function for the delete </orders/:id>route
const destroy = async (_req: Request, res: Response): Promise<void> => {
  try {
    const id = _req.params.id.trim();
    // Check if the id is valid
    const isIdValid = +id > 0 && !Number.isNaN(+id);
    if (!isIdValid) {
      res.status(400);
      res.json('Invalid order id. Please provide a valid id.');
    } else {
      const deletedOrder = await store.delete(+id);
      res.status(deletedOrder.id ? 200 : 404);
      res.json(
        deletedOrder.id
          ? deletedOrder
          : `Order with id ${id} not found to be delete.`
      );
    }
  } catch (err) {
    res.status(422);
    res.json(`An error occured. ${err}`);
  }
};

// Handler function for the delete </orders/:id/products/:product> route
const deleteProduct = async (_req: Request, res: Response): Promise<void> => {
  try {
    const orderId = _req.params.id && `${_req.params.id}`.trim();
    const productId = _req.params.product && `${_req.params.product}`.trim();
    // Check if the id is valid
    const isOrderIdValid = +orderId > 0 && !Number.isNaN(+orderId);
    const isProductIdValid = +productId > 0 && !Number.isNaN(+productId);
    const products = isOrderIdValid && (await store.getOrderProducts(+orderId));
    const reqProductExist =
      products &&
      products.find((p: OrderProduct): boolean => p.productId === +productId);
    if (!isOrderIdValid) {
      res.status(400);
      res.json('Invalid order id. Please provide a valid id.');
    } else if (!isProductIdValid) {
      res.status(400);
      res.json('Invalid product id. Please provide a valid id.');
    } else if (reqProductExist) {
      const deletedProduct = await store.deleteProduct(+orderId, +productId);
      res.status(200);
      res.json(deletedProduct);
    } else {
      res.status(404);
      res.json(
        `There is no product with id ${productId} is found in the order with id ${orderId}`
      );
    }
  } catch (err) {
    res.status(422);
    res.json(`An error occured. ${err}`);
  }
};

// Handler function for delete all products </orders/:id/products> route
const deleteAllProducts = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const orderId = _req.params.id && `${_req.params.id}`.trim();
    // Check if the id is valid
    const isOrderIdValid = +orderId > 0 && !Number.isNaN(+orderId);
    // Get the order
    const myOrder = isOrderIdValid && (await store.show(+orderId));
    if (!isOrderIdValid) {
      res.status(400);
      res.json('Invalid order id. Please provide a valid id.');
    } else if (myOrder && myOrder.id) {
      const deletedProducts = await store.deleteAllProducts(+orderId);
      res.status(200);
      res.json(deletedProducts);
    } else {
      res.status(404);
      res.json(`There is no order with id ${orderId} is found.`);
    }
  } catch (err) {
    res.status(422);
    res.json(`An error occured. ${err}`);
  }
};

// Handler function for getAllOrders for a user </users/:user/orders> route
const getAllOrders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const userId = _req.params.user && `${_req.params.user}`.trim();
    // Check if the id is valid
    const isUserIdValid = +userId > 0 && !Number.isNaN(+userId);
    const orderUser = isUserIdValid && (await userStore.show(+userId));
    if (userId === undefined || userId === '') {
      res.status(400);
      res.json(`Please provide a value to the useris id`);
    } else if (!isUserIdValid) {
      res.status(400);
      res.json(`Invalid user's id.`);
    } else if (!(orderUser || {}).id) {
      res.status(404);
      res.json(`There is no a user has id ${userId} is found.`);
    } else {
      const orders = await store.getAllOrders(+userId);
      res.status(200);
      res.json(orders);
    }
  } catch (err) {
    res.status(422);
    res.json(`An error occured. ${err}`);
  }
};

// Handler function for getActiveOrders for a user </users/:user/orders/active> route
const getActiveOrders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const userId = _req.params.user && `${_req.params.user}`.trim();
    // Check if the id is valid
    const isUserIdValid = +userId > 0 && !Number.isNaN(+userId);
    const orderUser = isUserIdValid && (await userStore.show(+userId));
    if (userId === undefined || userId === '') {
      res.status(400);
      res.json(`Please provide a value to the useris id`);
    } else if (!isUserIdValid) {
      res.status(400);
      res.json(`Invalid user's id.`);
    } else if (!(orderUser || {}).id) {
      res.status(404);
      res.json(`There is no a user has id ${userId} is found.`);
    } else {
      const orders = await store.getActiveOrders(+userId);
      res.status(200);
      res.json(orders);
    }
  } catch (err) {
    res.status(422);
    res.json(`An error occured. ${err}`);
  }
};

// Handler function for getCompleteOrders for a user </users/:user/orders/complete> route
const getCompleteOrders = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = _req.params.user && `${_req.params.user}`.trim();
    // Check if the id is valid
    const isUserIdValid = +userId > 0 && !Number.isNaN(+userId);
    const orderUser = isUserIdValid && (await userStore.show(+userId));
    if (userId === undefined || userId === '') {
      res.status(400);
      res.json(`Please provide a value to the useris id`);
    } else if (!isUserIdValid) {
      res.status(400);
      res.json(`Invalid user's id.`);
    } else if (!(orderUser || {}).id) {
      res.status(404);
      res.json(`There is no a user has id ${userId} is found.`);
    } else {
      const orders = await store.getCompleteOrders(+userId);
      res.status(200);
      res.json(orders);
    }
  } catch (err) {
    res.status(422);
    res.json(`An error occured. ${err}`);
  }
};

// Handler function for deleteAllOrders for a user </users/:user/orders> route
const deleteAllOrders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const userId = _req.params.user && `${_req.params.user}`.trim();
    // Check if the id is valid
    const isUserIdValid = +userId > 0 && !Number.isNaN(+userId);
    const orderUser = isUserIdValid && (await userStore.show(+userId));
    if (userId === undefined || userId === '') {
      res.status(400);
      res.json(`Please provide a value to the useris id`);
    } else if (!isUserIdValid) {
      res.status(400);
      res.json(`Invalid user's id.`);
    } else if (!(orderUser || {}).id) {
      res.status(404);
      res.json(`There is no a user has id ${userId} is found.`);
    } else {
      const orders = await store.deleteAllOrders(+userId);
      res.status(200);
      res.json(orders);
    }
  } catch (err) {
    res.status(422);
    res.json(`An error occured. ${err}`);
  }
};
// Handler function for deleteActiveOrders for a user </users/:user/orders/active> route
const deleteActiveOrders = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = _req.params.user && `${_req.params.user}`.trim();
    // Check if the id is valid
    const isUserIdValid = +userId > 0 && !Number.isNaN(+userId);
    const orderUser = isUserIdValid && (await userStore.show(+userId));
    if (userId === undefined || userId === '') {
      res.status(400);
      res.json(`Please provide a value to the useris id`);
    } else if (!isUserIdValid) {
      res.status(400);
      res.json(`Invalid user's id.`);
    } else if (!(orderUser || {}).id) {
      res.status(404);
      res.json(`There is no a user has id ${userId} is found.`);
    } else {
      const orders = await store.deleteActiveOrders(+userId);
      res.status(200);
      res.json(orders);
    }
  } catch (err) {
    res.status(422);
    res.json(`An error occured. ${err}`);
  }
};
// Handler function for deleteCompleteOrders for a user </users/:user/orders/complete> route
const deleteCompleteOrders = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = _req.params.user && `${_req.params.user}`.trim();
    // Check if the id is valid
    const isUserIdValid = +userId > 0 && !Number.isNaN(+userId);
    const orderUser = isUserIdValid && (await userStore.show(+userId));
    if (userId === undefined || userId === '') {
      res.status(400);
      res.json(`Please provide a value to the useris id`);
    } else if (!isUserIdValid) {
      res.status(400);
      res.json(`Invalid user's id.`);
    } else if (!(orderUser || {}).id) {
      res.status(404);
      res.json(`There is no a user has id ${userId} is found.`);
    } else {
      const orders = await store.deleteCompleteOrders(+userId);
      res.status(200);
      res.json(orders);
    }
  } catch (err) {
    res.status(422);
    res.json(`An error occured. ${err}`);
  }
};
const orderRoutes = (app: express.Application): void => {
  /**
   * Call the express methods that matches to the routes
   * and calls the RESTful route handler to create a response
   */

  app.get('/users/:user/orders', verifyAuthToken, getAllOrders);
  app.get('/users/:user/orders/active', verifyAuthToken, getActiveOrders);
  app.get('/users/:user/orders/complete', verifyAuthToken, getCompleteOrders);
  app.delete('/users/:user/orders', verifyAuthToken, deleteAllOrders);
  app.delete('/users/:user/orders/active', verifyAuthToken, deleteActiveOrders);
  app.delete(
    '/users/:user/orders/complete',
    verifyAuthToken,
    deleteCompleteOrders
  );

  app.put(
    '/orders/:id/products/:product',
    verifyAuthToken,
    updateQuantityProduct
  );
  app.delete('/orders/:id/products/:product', verifyAuthToken, deleteProduct);
  app.get('/orders/:id/products', verifyAuthToken, getOrderProducts);
  app.post('/orders/:id/products', verifyAuthToken, addProduct);
  app.delete('/orders/:id/products', verifyAuthToken, deleteAllProducts);
  app.get('/orders/:id/order-details', verifyAuthToken, getOrderDetails);
  app.put('/orders/:id', verifyAuthToken, updateStatus);
  app.delete('/orders/:id', verifyAuthToken, destroy);
  app.get('/orders/:id', verifyAuthToken, show);
  app.get('/orders/order-details', verifyAuthToken, indexDetails);
  app.get('/orders', verifyAuthToken, index);
  app.post('/orders', verifyAuthToken, create);
};

export default orderRoutes;
