import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateOrderDto } from 'apps/gateway/src/order/dto/create-order.dto';
import { ORDER_MESSAGE_PATTERN } from 'libs/constant/message-pattern.constant';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern(ORDER_MESSAGE_PATTERN.CREATE_ORDER)
  async createOrder(@Payload() payload: CreateOrderDto) {
    const { userId, items } = payload;
    return await this.ordersService.placeOrder(userId, items);
  }

  @MessagePattern(ORDER_MESSAGE_PATTERN.GET_ORDER_BY_ID)
  async getOrderById(@Payload() id: number) {
    return await this.ordersService.getOrderById(id);
  }

  @MessagePattern('get_orders_by_user')
  async getOrdersByUser(@Payload() userId: number) {
    return await this.ordersService.getOrdersByUser(userId);
  }
}
