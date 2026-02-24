import { EVENT } from '@app/common/constants/event';
import { EXCHANGE } from '@app/common/constants/exchange';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { of } from 'rxjs';
import { Order } from './entity/order.entity';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let inventoryClient: { send: jest.Mock; connect: jest.Mock };
  let productClient: { send: jest.Mock };
  let fanoutPublisher: { publish: jest.Mock };
  let orderRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
    manager: { transaction: jest.Mock };
  };

  beforeEach(async () => {
    inventoryClient = { send: jest.fn(), connect: jest.fn() };
    productClient = { send: jest.fn() };
    fanoutPublisher = { publish: jest.fn() };
    orderRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      manager: { transaction: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: HttpService, useValue: {} },
        { provide: 'INVENTORY_SERVICE', useValue: inventoryClient },
        { provide: 'PRODUCT_SERVICE', useValue: productClient },
        { provide: EXCHANGE.RMQ_PUBLISHER_CHANNEL, useValue: fanoutPublisher },
        { provide: getRepositoryToken(Order), useValue: orderRepository },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should connect the inventory client', async () => {
      await service.onModuleInit();

      expect(inventoryClient.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('placeOrder', () => {
    const userId = 1;
    const items = [
      { productId: 10, quantity: 2 },
      { productId: 20, quantity: 1 },
    ];

    it('should place an order successfully', async () => {
      inventoryClient.send
        .mockReturnValueOnce(of({ productId: 10, available: true, availableStock: 5, requestedQuantity: 2, sku: 'SKU-10' }))
        .mockReturnValueOnce(of({ productId: 20, available: true, availableStock: 3, requestedQuantity: 1, sku: 'SKU-20' }));

      productClient.send.mockReturnValue(
        of([
          { id: 10, price: 100, thumbnailUrl: '' } as any,
          { id: 20, price: 50, thumbnailUrl: '' } as any,
        ]),
      );

      const savedOrder = { id: 1, user_id: userId, total: 250 };
      const savedItem1 = { id: 1, order_id: 1, product_id: 10, quantity: 2, price: 200 };
      const savedItem2 = { id: 2, order_id: 1, product_id: 20, quantity: 1, price: 50 };
      orderRepository.manager.transaction.mockImplementation(
        (cb: (em: { create: jest.Mock; save: jest.Mock }) => Promise<unknown>) => {
          const entityManager = {
            create: jest.fn()
              .mockReturnValueOnce(savedOrder)
              .mockReturnValueOnce(savedItem1)
              .mockReturnValueOnce(savedItem2),
            save: jest.fn()
              .mockResolvedValueOnce(savedOrder)
              .mockResolvedValueOnce([savedItem1, savedItem2]),
          };
          return cb(entityManager);
        });

      const result = await service.placeOrder(userId, items);

      expect(inventoryClient.send).toHaveBeenCalledTimes(2);
      expect(inventoryClient.send).toHaveBeenCalledWith(
        'inventory.check_stock',
        { productId: 10, quantity: 2 },
      );
      expect(inventoryClient.send).toHaveBeenCalledWith(
        'inventory.check_stock',
        { productId: 20, quantity: 1 },
      );

      expect(productClient.send).toHaveBeenCalledWith(
        'product.findByIds',
        [10, 20],
      );

      expect(fanoutPublisher.publish).toHaveBeenCalledWith(
        EXCHANGE.ORDERS_EXCHANGE,
        EVENT.ORDER_CREATED_EVENT,
        expect.any(Buffer),
      );

      expect(result).toEqual({ order: savedOrder, orderItems: [savedItem1, savedItem2] });
    });

    it('should throw BadRequestException when stock is not available', async () => {
      inventoryClient.send
        .mockReturnValueOnce(of({ productId: 10, available: true, availableStock: 5, requestedQuantity: 2, sku: 'SKU-10' }))
        .mockReturnValueOnce(of({ productId: 20, available: false, availableStock: 0, requestedQuantity: 1, sku: 'SKU-20' }));

      await expect(service.placeOrder(userId, items)).rejects.toThrow(
        new BadRequestException('Stock not available'),
      );

      expect(productClient.send).not.toHaveBeenCalled();
      expect(orderRepository.manager.transaction).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when transaction returns null', async () => {
      inventoryClient.send
        .mockReturnValue(of({ productId: 10, available: true, availableStock: 5, requestedQuantity: 2, sku: 'SKU-10' }));

      productClient.send.mockReturnValue(
        of([{ id: 10, price: 100, thumbnailUrl: '' } as any]),
      );

      orderRepository.manager.transaction.mockResolvedValue(null);

      await expect(
        service.placeOrder(userId, [{ productId: 10, quantity: 2 }]),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getOrderById', () => {
    it('should return an order with enriched thumbnails when found', async () => {
      const order = {
        id: 1,
        user_id: 1,
        total: 200,
        items: [
          { id: 1, product_id: 10, quantity: 2, price: 200 },
        ],
      };
      orderRepository.findOne.mockResolvedValue(order);

      productClient.send.mockReturnValue(
        of([{ id: 10, thumbnailUrl: 'https://cdn.example.com/img.jpg' } as any]),
      );

      const result = await service.getOrderById(1);

      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['items'],
      });
      expect(result.items[0].thumbnail_url).toBe('https://cdn.example.com/img.jpg');
    });

    it('should throw BadRequestException when order not found', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      await expect(service.getOrderById(999)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getOrderById(999)).rejects.toThrow(
        'Order with id 999 not found',
      );
    });
  });

  describe('getOrdersByUser', () => {
    it('should return all orders for user with enriched thumbnails', async () => {
      const orders = [
        {
          id: 1,
          user_id: 1,
          total: 200,
          items: [{ id: 1, product_id: 10, quantity: 2, price: 200 }],
        },
        {
          id: 2,
          user_id: 1,
          total: 50,
          items: [{ id: 2, product_id: 20, quantity: 1, price: 50 }],
        },
      ];
      orderRepository.find.mockResolvedValue(orders);

      productClient.send.mockReturnValue(
        of([
          { id: 10, thumbnailUrl: 'https://cdn.example.com/a.jpg' } as any,
          { id: 20, thumbnailUrl: 'https://cdn.example.com/b.jpg' } as any,
        ]),
      );

      const result = await service.getOrdersByUser(1);

      expect(orderRepository.find).toHaveBeenCalledWith({
        where: { user_id: 1 },
        relations: ['items'],
      });
      expect(result).toHaveLength(2);
      expect((result[0].items[0]).thumbnail_url).toBe('https://cdn.example.com/a.jpg');
      expect((result[1].items[0]).thumbnail_url).toBe('https://cdn.example.com/b.jpg');
    });

    it('should return empty array when user has no orders', async () => {
      orderRepository.find.mockResolvedValue([]);

      const result = await service.getOrdersByUser(1);

      expect(result).toEqual([]);
    });
  });
});
