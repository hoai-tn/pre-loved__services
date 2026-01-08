import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RewardsService {
  private readonly logger = new Logger(RewardsService.name);

  async addRewards(order: any) {
    this.logger.log(`Adding rewards for customer on order ${order.id}...`);

    // Simulate a time-consuming task
    await new Promise(resolve => setTimeout(resolve, 500));

    this.logger.log(`Rewards added successfully for order ${order.id}.`);
  }
}
