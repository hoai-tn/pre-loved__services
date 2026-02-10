import { forwardRef, Module } from '@nestjs/common';
import { GatewayModule } from '../gateway.module';
import { ShipmentController } from './shipment.controller';
import { ShipmentService } from './shipment.service';

@Module({
  imports: [forwardRef(() => GatewayModule)],
  controllers: [ShipmentController],
  providers: [ShipmentService],
})
export class ShipmentModule {}
