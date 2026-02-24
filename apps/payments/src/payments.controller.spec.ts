import { RmqService } from '@app/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

const mockPaymentsService = {
  processPayment: jest.fn(),
};

const mockRmqService = {
  ack: jest.fn(),
};

const mockRmqContext = {
  getChannelRef: jest.fn(),
  getMessage: jest.fn(),
};

describe('PaymentsController', () => {
  let paymentsController: PaymentsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        { provide: PaymentsService, useValue: mockPaymentsService },
        { provide: RmqService, useValue: mockRmqService },
      ],
    }).compile();

    paymentsController = app.get<PaymentsController>(PaymentsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(paymentsController).toBeDefined();
  });

  describe('handleOrderCreated', () => {
    it('should process payment and acknowledge the message', async () => {
      const orderData = { orderId: '123', amount: 100 };
      mockPaymentsService.processPayment.mockResolvedValue(undefined);

      await paymentsController.handleOrderCreated(
        orderData,
        mockRmqContext as any,
      );

      expect(mockPaymentsService.processPayment).toHaveBeenCalledWith(
        orderData,
      );
      expect(mockRmqService.ack).toHaveBeenCalledWith(mockRmqContext);
    });
  });
});
