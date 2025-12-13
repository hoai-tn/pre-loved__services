import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';

@ApiTags('Order')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('user/:id')
  @ApiOperation({ summary: 'Get orders and user info by user id' })
  @ApiResponse({ status: 200, description: 'Order and user info.' })
  async getOrderByUser(@Param('id') id: string) {
    return await this.orderService.getOrderByUser(id);
  }

  @Post()
  @ApiOperation({ summary: 'Place a new order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createOrder(@Body(ValidationPipe) payload: CreateOrderDto) {
    return await this.orderService.createOrder(payload);
  }
}
