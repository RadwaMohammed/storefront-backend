import { ProductStore } from '../product';

const store = new ProductStore();

describe('Product Model', () => {
  it('should have an index method', (): void => {
    expect(store.index).toBeDefined();
  });

  it('should have a productsByCategory method', (): void => {
    expect(store.productsByCategory).toBeDefined();
  });

  it('should have a show method', (): void => {
    expect(store.show).toBeDefined();
  });

  it('should have a create method', (): void => {
    expect(store.create).toBeDefined();
  });

  it('should have a update method', (): void => {
    expect(store.update).toBeDefined();
  });

  it('should have a delete method', (): void => {
    expect(store.delete).toBeDefined();
  });

  it('create method should add a product', async (): Promise<void> => {
    const result = await store.create({
      id: 1,
      name: 'Skipping Jump Rope',
      category: 'Sporting Goods',
      price: 20,
      description:
        'This skipping rope is made of high-quality material and does not break easily.'
    });
    expect(result).toEqual({
      id: 1,
      name: 'Skipping Jump Rope',
      category: 'Sporting Goods',
      price: 20,
      description:
        'This skipping rope is made of high-quality material and does not break easily.'
    });
  });

  it('productsByCategory method should return list of products by category', async (): Promise<void> => {
    const result = await store.productsByCategory('Sporting Goods');
    expect(result).toEqual([
      {
        id: 1,
        name: 'Skipping Jump Rope',
        category: 'Sporting Goods',
        price: 20,
        description:
          'This skipping rope is made of high-quality material and does not break easily.'
      }
    ]);
  });

  it('index method should return a list of products', async (): Promise<void> => {
    const result = await store.index();
    expect(result).toEqual([
      {
        id: 1,
        name: 'Skipping Jump Rope',
        category: 'Sporting Goods',
        price: 20,
        description:
          'This skipping rope is made of high-quality material and does not break easily.'
      }
    ]);
  });

  it('show method should return the correct product', async (): Promise<void> => {
    const result = await store.show(1);
    expect(result).toEqual({
      id: 1,
      name: 'Skipping Jump Rope',
      category: 'Sporting Goods',
      price: 20,
      description:
        'This skipping rope is made of high-quality material and does not break easily.'
    });
  });

  it('update method should update the product ', async (): Promise<void> => {
    const edits = {
      name: 'Skipping Jump Rope with Wooden Handles',
      price: 30
    };
    const result = await store.update(1, edits);
    expect(result.name).toEqual(edits.name);
    expect(result.price).toEqual(edits.price);
  });

  it('delete method should remove the product', async (): Promise<void> => {
    await store.delete(1);
    const result = await store.index();
    expect(result).toEqual([]);
  });
});
