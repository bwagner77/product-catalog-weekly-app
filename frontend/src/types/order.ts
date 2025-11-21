export interface OrderItemSnapshot {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItemSnapshot[];
  total: number;
  status: 'submitted';
  createdAt: string;
  updatedAt: string;
}
