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
import { IProduct } from 'libs/common/src/interfaces';
import { IStockCheckResult } from 'libs/common/src/interfaces/inventory.interface';
import { INVENTORY_MESSAGE_PATTERNS } from 'libs/constant/message-pattern-inventory.constant';
import { PRODUCT_MESSAGE_PATTERNS } from 'libs/constant/message-pattern-product.constant';
import { firstValueFrom, map } from 'rxjs';
import { Repository } from 'typeorm';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/order_item.entity';
interface IOrderItem {
  productId: string;
  quantity: number;
  price?: number;
}
@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    // @Inject(EXCHANGE.RMQ_PUBLISHER_CHANNEL) private readonly fanoutChannel: Channel,
    private readonly httpService: HttpService,
    @Inject('INVENTORY_SERVICE') private readonly inventoryClient: ClientProxy,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
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
    this.logger.debug('[ORDERS] Product prices', productPrices);
    const itemsWithPrices = this.#calculateItemsPrices(items, productPrices);
    this.logger.debug('[ORDERS] Items with prices', itemsWithPrices);
    const total = this.#calculateTotal(itemsWithPrices);
    this.logger.debug('[ORDERS] Total', total);

    // 3. Save order and order items using transaction
    const result = await this.orderRepository.manager.transaction(
      async entityManager => {
        const order = entityManager.create(Order, { user_id: userId, total });
        await entityManager.save(order);
        const orderItems = itemsWithPrices.map(item =>
          entityManager.create(OrderItem, { ...item, order_id: order.id }),
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

    return result;
    // 2. Create order in Order Service
    // const order = await this.orderRepository.save(
    //   this.orderRepository.create({ user_id: userId, total: 0 }),
    // );

    //3. Publish order to Order Fanout Exchange

    // const total = items.reduce(
    //   (sum, item) => sum + item.price * item.quantity,
    //   0,
    // );
    // // Tạo order trước
    // const order = await this.orderRepository.save(
    //   this.orderRepository.create({ user_id: userId, total }),
    // );
    // // Tạo order_items với order_id vừa tạo
    // const orderItems = items.map(item =>
    //   this.orderItemRepository.create({ ...item, order_id: order.id }),
    // );
    // await this.orderItemRepository.save(orderItems);
    // // Gán items vào order để trả về
    // order.items = orderItems;
    // return order;
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
