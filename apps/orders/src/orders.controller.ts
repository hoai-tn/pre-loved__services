import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateOrderDto } from 'apps/gateway/src/order/dto/create-order.dto';
import { ORDER_MESSAGE_PATTERN } from 'libs/constant/message-pattern.constant';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern(ORDER_MESSAGE_PATTERN.CREATE_ORDER)
  async createOrder(@Payload() payload: CreateOrderDto) {
    const { userId, items } = payload;
    return await this.ordersService.placeOrder(userId, items);
  }

  @MessagePattern('get_orders_by_user')
  async getOrdersByUser(@Payload() userId: number) {
    return await this.ordersService.getOrdersByUser(userId);
  }
}
