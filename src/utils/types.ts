// The Typescript type for the user model
export type User = {
  id?: number;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
};
// The Typescript type for the user to be update
// Make its properties optional as the user may not nee to update all the keys
export type UserUpdate = {
  firstName?: string;
  lastName?: string;
  password?: string;
  email?: string;
};
// The Typescript type for the user from database
export type DBuser = {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  password_digest: string;
  email: string;
};

// DB error type
export interface DBerrorException extends Error {
  code?: string | undefined;
  constraint?: string | undefined;
  detail?: string | undefined;
}

// The Typescript type for the product model
export type Product = {
  id?: number;
  name: string;
  category?: string;
  price: string; // as the column of price is decimal type
  description?: string;
};
// The Typescript type for the product to be update
// Make its properties optional as the user may not need to update all the keys
export type ProductUpdate = {
  name?: string;
  category?: string;
  price?: string; // as the column of price is decimal type
  description?: string;
};

// The Typescript type for the order model
export type Order = {
  id?: number;
  status: string;
  userId: number;
};

// The Typescript type for the order from database
export type DBorder = {
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
export type DBorderproduct = {
  product_id: number;
  quantity: number;
};
// The Typescript type for the order details
export type OrderDetails = {
  orderId: number;
  userId?: number;
  status?: string;
  products: OrderProduct[];
};
