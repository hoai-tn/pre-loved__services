import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role, Roles } from '../common/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
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
  @UseGuards(AuthGuard)
  @Roles(Role.BUYER)
  @ApiOperation({ summary: 'Place a new order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createOrder(@Body(ValidationPipe) payload: CreateOrderDto) {
    return await this.orderService.createOrder(payload);
  }

  @Post('test')
  @UseGuards(AuthGuard)
  @Roles(Role.BUYER)
  @ApiOperation({ summary: 'Place a new order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  createOrderTest(
    @User() user: { tid: string; sub: string },
    @Body(ValidationPipe) payload: CreateOrderDto,
  ) {
    return { message: 'Order created successfully', data: { user, payload } };
  }
}
