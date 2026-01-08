import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  async processPayment(order: any) {
    // ... Payment processing business logic here ...
    // Example: call payment gateway, update transaction status...
    this.logger.log(`Processing payment for order ${JSON.stringify(order)}...`);

    // Simulate a time-consuming task
    await new Promise(resolve => setTimeout(resolve, 500));

    this.logger.log(
      `Payment processed successfully for order ${JSON.stringify(order)}.`,
    );
  }
}
