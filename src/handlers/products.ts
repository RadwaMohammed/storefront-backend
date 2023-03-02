import express, { Request, Response } from 'express';
import { Product, ProductStore } from '../models/product';
import verifyAuthToken from '../middlewares/auth';

const store = new ProductStore();

// Handler function for the index route
const index = async (_req: Request, res: Response): Promise<void> => {
  const products = await store.index();
  res.status(200);
  res.json(products);
};

// Handler function for the show route
const show = async (_req: Request, res: Response): Promise<void> => {
  const product = await store.show(_req.params.id);
  res.status(product ? 200 : 404);
  res.json(product || `Product with id ${_req.params.id} not found.`);
};

// Handler function for the create route
const create = async (_req: Request, res: Response): Promise<void> => {
  try {
    // The requested product to be created
    const product: Product = {
      name: _req.body.name,
      category: _req.body.category,
      price: _req.body.price,
      description: _req.body.description
    };
    // A type represents all the property names for product object
    type ProductKeyType = keyof typeof product;

    /**
     * As category and description are optional
     * so if the user didn't provide any of them will be acceptable
     */
    if (!product.category || !`${product.category}`.trim()) {
      delete product.category;
    }
    if (!product.description || !`${product.description}`.trim()) {
      delete product.description;
    }
    // Find if there is a Mandatory key with no value
    const noValue = Object.keys(product).find(
      (key: string): boolean =>
        !product[key as ProductKeyType] ||
        !`${product[key as ProductKeyType]}`.trim()
    );
    // Check if the price is avalid positive number
    const isPriceValid = +product.price >= 0 && !Number.isNaN(+product.price);

    if (noValue) {
      res.status(400);
      res.json(`Please provide a value to the ${noValue}, It can't be empty.`);
    } else if (product.price && !isPriceValid) {
      res.status(400);
      res.json('The price should be a positive number');
    } else {
      const newProduct = await store.create(product);
      res.status(200);
      res.json(newProduct);
    }
  } catch (err) {
    res.status(422);
    res.json(`An error occured couldn't create a new product. err: ${err}`);
  }
};

// Handler function for the update route
const update = async (_req: Request, res: Response): Promise<void> => {
  try {
    // The requested product to be updated
    const product: Product = {
      name: _req.body.name,
      category: _req.body.category,
      price: _req.body.price,
      description: _req.body.description
    };
    // A type represents all the property names for product object
    type ProductKeyType = keyof typeof product;
    /**
     * The user may not want to modify all properties
     * so if the user didn't provide any of them will be acceptable
     */
    Object.keys(product).forEach(
      (key: string): boolean =>
        product[key as ProductKeyType] === undefined &&
        delete product[key as ProductKeyType]
    );
    // Find if there is a key with no value
    const noValue = Object.keys(product).find(
      (key: string): boolean =>
        !product[key as ProductKeyType] ||
        !`${product[key as ProductKeyType]}`.trim()
    );
    // As the default value for description is empty
    // so if the user didn't provide a value will be acceptable to be updated to empty
    if (noValue && noValue !== 'description') {
      res.status(400);
      res.json(`Please provide a value to the ${noValue}, It can't be empty.`);
    } // Check if the price is avalid positive number
    else if (
      product.price &&
      (+product.price < 0 || Number.isNaN(+product.price))
    ) {
      res.status(400);
      res.json('The price should be a positive number');
    } else {
      const updatedProduct = await store.update(_req.params.id, product);
      res.status(200);
      res.json(updatedProduct);
    }
  } catch (err) {
    res.status(400);
    res.json(`An error occured couldn't update the product. err: ${err}`);
  }
};

// Handler function for the delete route
const destroy = async (_req: Request, res: Response): Promise<void> => {
  const deletedProduct = await store.delete(_req.params.id);
  res.status(deletedProduct ? 200 : 404);
  res.json(
    deletedProduct ||
      `Product with id ${_req.params.id} not found to be deleted.`
  );
};

const productRoutes = (app: express.Application): void => {
  /**
   * Call the express methods that matches to the routes
   * and calls the RESTful route handler to create a response
   */
  app.get('/products', index);
  app.get('/products/:id', show);
  app.post('/products', verifyAuthToken, create);
  app.post('/products/:id', verifyAuthToken, update);
  app.delete('/products/:id', verifyAuthToken, destroy);
};

export default productRoutes;
