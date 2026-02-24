import { CachedService } from '@app/cached';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ORDER_MESSAGE_PATTERN,
  USER_MESSAGE_PATTERN,
} from 'libs/constant/message-pattern.constant';
import { NAME_SERVICE_TCP } from 'libs/constant/port-tcp.constant';
import { firstValueFrom, timeout } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    @Inject(NAME_SERVICE_TCP.ORDERS_SERVICE)
    private readonly ordersClient: ClientProxy,
    @Inject(NAME_SERVICE_TCP.USER_SERVICE)
    private readonly userClient: ClientProxy,
    @Inject(CachedService) private readonly redisService: CachedService,
  ) {}

  async createOrder(payload: CreateOrderDto) {
    this.logger.log(
      `[ORDER-TCP] Creating order with payload: ${JSON.stringify(payload)}`,
    );
    const result = await firstValueFrom<unknown>(
      this.ordersClient
        .send(ORDER_MESSAGE_PATTERN.CREATE_ORDER, payload)
        .pipe(timeout(5000)),
    );
    await this.redisService.del(`order_user:${payload.userId}`);
    return result;
  }

  async getOrderById(id: string) {
    const orderId = Number(id);
    if (isNaN(orderId)) {
      throw new Error('Invalid order id');
    }
    return await firstValueFrom<unknown>(
      this.ordersClient
        .send(ORDER_MESSAGE_PATTERN.GET_ORDER_BY_ID, orderId)
        .pipe(timeout(5000)),
    );
  }

  async getOrderByUser(
    userId: string,
  ): Promise<{ user: unknown; orders: unknown }> {
    const cacheKey = `order_user:${userId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as { user: unknown; orders: unknown };
    }
    const uid = Number(userId);
    if (isNaN(uid)) {
      throw new Error('Invalid userId');
    }

    const [orders, user] = await Promise.all<unknown[]>([
      firstValueFrom<unknown>(
        this.ordersClient
          .send(ORDER_MESSAGE_PATTERN.GET_ORDERS_BY_USER, uid)
          .pipe(timeout(5000)),
      ),
      firstValueFrom<unknown>(
        this.userClient
          .send({ cmd: USER_MESSAGE_PATTERN.GET_USER_INFO }, uid)
          .pipe(timeout(5000)),
      ),
    ]);

    const result = { user, orders };
    await this.redisService.set(cacheKey, JSON.stringify(result), 300);
    return result;
  }
}
