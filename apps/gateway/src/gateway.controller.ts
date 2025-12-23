import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Gateway')
@Controller('gateway')
export class GatewayController {
  // constructor(private readonly gatewayService: GatewayService) { }
  // @Post()
  // @ApiOperation({ summary: 'Place a new order' })
  // @ApiBody({ type: CreateOrderDto })
  // @ApiResponse({ status: 201, description: 'Order created successfully' })
  // async createOrder(@Body() payload: CreateOrderDto) {
  //   return this.gatewayService.createOrder(payload);
  // }

  @Get('health')
  @ApiOperation({ summary: 'Check health of the gateway' })
  @ApiResponse({ status: 200, description: 'Gateway is healthy' })
  health() {
    return { status: 'ok' };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get metrics of the gateway' })
  @ApiResponse({ status: 200, description: 'Gateway metrics' })
  metrics() {
    return { status: 'ok' };
  }
}
