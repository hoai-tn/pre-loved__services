import { EVENT } from '@app/common/constants/event';
import { EXCHANGE } from '@app/common/constants/exchange';
import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from 'amqp-connection-manager';
import { IOrderItem, IProduct } from 'libs/common/src/interfaces';
import { IStockCheckResult } from 'libs/common/src/interfaces/inventory.interface';
import { INVENTORY_MESSAGE_PATTERNS } from 'libs/constant/message-pattern-inventory.constant';
import { PRODUCT_MESSAGE_PATTERNS } from 'libs/constant/message-pattern-product.constant';
import { firstValueFrom, map } from 'rxjs';
import { Repository } from 'typeorm';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/order_item.entity';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    // @Inject(EXCHANGE.RMQ_PUBLISHER_CHANNEL) private readonly fanoutChannel: Channel,
    private readonly httpService: HttpService,
    @Inject('INVENTORY_SERVICE') private readonly inventoryClient: ClientProxy,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,

    @Inject(EXCHANGE.RMQ_PUBLISHER_CHANNEL)
    private readonly fanoutPublisher: Channel,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async onModuleInit() {
    await this.inventoryClient.connect();
  }

  async placeOrder(userId: number, items: Array<IOrderItem>) {
    this.logger.log('[ORDERS] Place order', userId, items);
    //1. Check stock in Inventory Service
    const stockCheckResults = await Promise.all(
      items.map(async item =>
        firstValueFrom(
          this.inventoryClient.send<
            IStockCheckResult,
            { productId: string; quantity: number }
          >(INVENTORY_MESSAGE_PATTERNS.INVENTORY_CHECK_STOCK, {
            productId: item.productId,
            quantity: item.quantity,
          }),
        ),
      ),
    );
    //2. Get prices
    this.logger.log('[ORDERS] Stock check results', stockCheckResults);
    if (stockCheckResults.some(result => !result.available)) {
      this.logger.error('[ORDERS] Stock not available', userId, items);
      throw new BadRequestException('Stock not available');
    }

    const productPrices = await Promise.all(
      items.map(async item =>
        firstValueFrom(
          this.productClient
            .send<
              IProduct,
              string
            >(PRODUCT_MESSAGE_PATTERNS.PRODUCT_FIND_BY_ID, item.productId)
            .pipe(
              map(product => ({ productId: product.id, price: product.price })),
            ),
        ),
      ),
    );
    const itemsWithPrices = this.#calculateItemsPrices(items, productPrices);
    const total = this.#calculateTotal(itemsWithPrices);

    // 3. Save order and order items using transaction
    const result = await this.orderRepository.manager.transaction(
      async entityManager => {
        const order = entityManager.create(Order, { user_id: userId, total });
        await entityManager.save(order);

        const orderItems = itemsWithPrices.map(item =>
          entityManager.create(OrderItem, {
            product_id: Number(item.productId),
            quantity: item.quantity,
            price: item.price,
            order_id: order.id,
          }),
        );
        await entityManager.save(orderItems);

        return { order, orderItems };
      },
    );
    if (!result) {
      throw new InternalServerErrorException(
        'Failed to save order and order items',
      );
    }
    //5. Publish Order Created
    const payload = {
      pattern: EVENT.ORDER_CREATED_EVENT,
      data: {
        order: result.order,
        orderItems: result.orderItems.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    };
    this.fanoutPublisher.publish(
      EXCHANGE.ORDERS_EXCHANGE,
      EVENT.ORDER_CREATED_EVENT,
      Buffer.from(JSON.stringify(payload)),
    );

    return { order: result.order, orderItems: result.orderItems };
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      where: { user_id: userId },
      relations: ['items'],
    });
    return orders;
  }

  #calculateItemsPrices(
    items: IOrderItem[],
    prices: Array<{ productId: string; price: number }>,
  ) {
    const priceMap = new Map<string, number>(
      prices.map(price => [price.productId, price.price]),
    );
    return items.map(item => ({
      ...item,
      price: (priceMap.get(item.productId) ?? 0) * item.quantity,
    }));
  }

  #calculateTotal(items: IOrderItem[]) {
    return items.reduce((sum, item) => sum + (item.price ?? 0), 0);
  }
}
