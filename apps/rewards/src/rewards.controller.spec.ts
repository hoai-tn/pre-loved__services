import { RmqService } from '@app/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';

const mockRewardsService = {
  addRewards: jest.fn(),
};

const mockRmqService = {
  ack: jest.fn(),
};

const mockRmqContext = {
  getChannelRef: jest.fn(),
  getMessage: jest.fn(),
};

describe('RewardsController', () => {
  let rewardsController: RewardsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RewardsController],
      providers: [
        { provide: RewardsService, useValue: mockRewardsService },
        { provide: RmqService, useValue: mockRmqService },
      ],
    }).compile();

    rewardsController = app.get<RewardsController>(RewardsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(rewardsController).toBeDefined();
  });

  describe('handleOrderCreated', () => {
    it('should add rewards and acknowledge the message', async () => {
      const orderData = { id: 'order-1', userId: 'user-1' };
      mockRewardsService.addRewards.mockResolvedValue(undefined);

      await rewardsController.handleOrderCreated(
        orderData,
        mockRmqContext as any,
      );

      expect(mockRewardsService.addRewards).toHaveBeenCalledWith(orderData);
      expect(mockRmqService.ack).toHaveBeenCalledWith(mockRmqContext);
    });
  });
});
