import { UserStore } from '../user';

const store = new UserStore();

describe('User Model', () => {
  it('should have an index method', (): void => {
    expect(store.index).toBeDefined();
  });

  it('should have a show method', (): void => {
    expect(store.show).toBeDefined();
  });

  it('should have a create method', (): void => {
    expect(store.create).toBeDefined();
  });

  it('should have a delete method', (): void => {
    expect(store.delete).toBeDefined();
  });

  it('should have an authenticate method', (): void => {
    expect(store.authenticate).toBeDefined();
  });

  it('index method should return a list of users', async (): Promise<void> => {
    const result = await store.index();
    expect(result).toEqual([]);
  });

  it('create method should create a user', async (): Promise<void> => {
    const result = await store.create({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john_doe',
      password: 'pass@store123',
      email: 'mail2johndoe@gmail.com'
    });
    const usersList = await store.index();
    expect(result).toEqual(usersList[0]);
  });

  it('show method should return the correct user', async (): Promise<void> => {
    const result = await store.show(1);
    const usersList = await store.index();
    expect(result).toEqual(usersList[0]);
  });

  it('update method should update the user', async (): Promise<void> => {
    const result = await store.update(1, { lastName: 'tom' });
    const usersList = await store.index();
    expect(result).toEqual(usersList[0]);
  });

  it('authenticate method should return the user if password is correct', async (): Promise<void> => {
    const result = await store.authenticate('john_doe', 'pass@store123');
    const usersList = await store.index();
    expect(result).toEqual(usersList[0]);
  });

  it('authenticate method should return error if password is incorrect', async (): Promise<void> => {
    await expectAsync(
      store.authenticate('john_doe', 'passw0123')
    ).toBeRejectedWith(
      new Error(`Could not validate the user. ${new Error(`Wrong Password`)}`)
    );
  });

  it('authenticate method should return null if the user not exist', async (): Promise<void> => {
    const result = await store.authenticate('kitty_doe', 'pass@store123');
    expect(result).toBeNull;
  });

  it('delete method should remove the user', async (): Promise<void> => {
    await store.delete(1);
    const result = await store.index();
    expect(result).toEqual([]);
  });
});
