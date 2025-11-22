export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId?: string; // optional association
  stock: number; // non-negative integer
  imageUrl: string; // required non-empty
  createdAt: string; // ISO date string from API
  updatedAt: string; // ISO date string from API
}

export default Product;
