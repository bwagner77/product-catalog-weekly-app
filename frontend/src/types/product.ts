export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt: string; // ISO date string from API
  updatedAt: string; // ISO date string from API
}

export default Product;
