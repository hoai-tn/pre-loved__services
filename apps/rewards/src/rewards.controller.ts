import { RmqService } from '@app/common';
import { EVENT } from '@app/common/constants/event';
import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RewardsService } from './rewards.service';

// console.log('Listening for event pattern:', EVENT.ORDER_CREATED_EVENT);

@Controller()
export class RewardsController {
  private readonly logger = new Logger(RewardsController.name);

  constructor(
    private readonly rewardsService: RewardsService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern(EVENT.ORDER_CREATED_EVENT)
  async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(
      `[REWARDS] Received event for order: ${JSON.stringify(data)}`,
    );

    await this.rewardsService.addRewards(data);

    this.rmqService.ack(context);
    this.logger.log(
      `[REWARDS] Acknowledged event for order ${JSON.stringify(data)}`,
    );
  }
}
