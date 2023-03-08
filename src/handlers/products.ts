import express, { Request, Response } from 'express';
import { Product, ProductUpdate, ProductStore } from '../models/product';
import verifyAuthToken from '../middlewares/auth';

const store = new ProductStore();

// Handler function for the index route
const index = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await store.index();
    res.status(200);
    res.json(products);
  } catch (err) {
    res.status(400);
    res.json(`An error occured. ${err}`);
  }
};

// Handler function for the productsByCategory route
const productsByCategory = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const category = _req.params.category.trim();
    const products = await store.productsByCategory(category);
    res.status(200);
    res.json(products);
  } catch (err) {
    res.status(400);
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
      res.json('Invalid product id. Please provide a valid id.');
    } else {
      const product = await store.show(+id);
      res.status(product ? 200 : 404);
      res.json(product || `Product with id ${id} not found.`);
    }
  } catch (err) {
    res.status(422);
    res.json(`An error occured. ${err}`);
  }
};

// Handler function for the create route
const create = async (req: Request, res: Response): Promise<void> => {
  try {
    // The requested product to be created
    const product: Product = {
      name: req.body.name && `${req.body.name}`.trim(),
      category: req.body.category && `${req.body.category}`.trim(),
      price: req.body.price && `${req.body.price}`.trim(),
      description: req.body.description && `${req.body.description}`.trim()
    };
    // A type represents all the property names for product object
    type ProductKeyType = keyof typeof product;

    /**
     * As category and description are optional
     * so if the user didn't provide any of them will be acceptable
     */
    if (!product.category) {
      delete product.category;
    }
    if (!product.description) {
      delete product.description;
    }
    // Find if there is a Mandatory key with no value
    const noValue = Object.keys(product).find(
      (key: string): boolean =>
        product[key as ProductKeyType] === undefined ||
        product[key as ProductKeyType] === ''
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
    res.json(`An error occured. ${err}`);
  }
};

// Handler function for the update route
const update = async (req: Request, res: Response): Promise<void> => {
  try {
    // The requested product to be updated
    const product: ProductUpdate = {
      name: req.body.name && `${req.body.name}`.trim(),
      category: req.body.category && `${req.body.category}`.trim(),
      price: req.body.price && `${req.body.price}`.trim(),
      description: req.body.description && `${req.body.description}`.trim()
    };
    // The requesrted product id
    const id = req.params.id.trim();
    // Check if the id is valid
    const isIdValid = +id > 0 && !Number.isNaN(+id);
    // Get the product
    const myProduct = await store.show(+id);
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
        product[key as ProductKeyType] === undefined ||
        product[key as ProductKeyType] === ''
    );
    // Check te product id
    if (!isIdValid) {
      res.status(400);
      res.json('Invalid product id. Please provide a valid id.');
    }
    // First check if the prodct exist
    else if (!myProduct) {
      res.status(404);
      res.json(`Product with id ${id} not found to be update.`);
    }
    // As the default value for description is empty
    // so if the user didn't provide a value will be acceptable to be updated to empty
    else if (noValue && noValue !== 'description') {
      res.status(400);
      res.json(`Please provide a value to the ${noValue}, It can't be empty.`);
    } // Check if the price is a valid positive number
    else if (
      product.price &&
      (+product.price < 0 || Number.isNaN(+product.price))
    ) {
      res.status(400);
      res.json('The price should be a positive number');
    } else {
      const updatedProduct = await store.update(+id, product);
      res.status(200);
      res.json(updatedProduct);
    }
  } catch (err) {
    res.status(400);
    res.json(`An error occured. ${err}`);
  }
};

// Handler function for the delete route
const destroy = async (_req: Request, res: Response): Promise<void> => {
  try {
    const id = _req.params.id.trim();
    // Check if the id is valid
    const isIdValid = +id > 0 && !Number.isNaN(+id);
    if (!isIdValid) {
      res.status(400);
      res.json('Invalid product id. Please provide a valid id.');
    } else {
      const deletedProduct = await store.delete(+id);
      res.status(deletedProduct ? 200 : 404);
      res.json(
        deletedProduct || `Product with id ${id} not found to be delete.`
      );
    }
  } catch (err) {
    res.status(400);
    res.json(`An error occured. ${err}`);
  }
};

const productRoutes = (app: express.Application): void => {
  /**
   * Call the express methods that matches to the routes
   * and calls the RESTful route handler to create a response
   */
  app.get('/products', index);
  app.get('/products/categories/:category', productsByCategory);
  app.get('/products/:id', show);
  app.post('/products', verifyAuthToken, create);
  app.put('/products/:id', verifyAuthToken, update);
  app.delete('/products/:id', verifyAuthToken, destroy);
};

export default productRoutes;
