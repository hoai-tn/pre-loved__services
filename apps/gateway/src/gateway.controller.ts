import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Gateway')
@Controller('gateway')
export class GatewayController {
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
