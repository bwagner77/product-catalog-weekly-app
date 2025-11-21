export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInput {
  name: string;
}

export default Category;