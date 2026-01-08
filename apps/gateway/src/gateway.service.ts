import { CMD } from '@app/common/constants/cmd';
import { TCP } from '@app/common/constants/TCP';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  constructor(
    @Inject(TCP.ORDERS_SERVICE) private readonly ordersClient: ClientProxy,
  ) {}

  async createOrder(payload: any) {
    const resultObservable = this.ordersClient.send(
      { cmd: CMD.CREATE_ORDER },
      payload,
    );
    // Convert Observable to Promise so it can be awaited
    const result = await firstValueFrom(resultObservable);
    this.logger.log(
      `[GATEWAY] Received response from Orders Service: ${JSON.stringify(result)}`,
    );
    return result;
  }
}
