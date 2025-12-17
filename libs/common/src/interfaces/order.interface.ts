interface IOrderItem {
  productId: string;
  quantity: number;
  price?: number;
}

interface IOrder {
  id: string;
  userId: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderCreatedEventPayload {
  order: IOrder;
  orderItems: IOrderItem[];
}
export { IOrder, IOrderItem, OrderCreatedEventPayload };
