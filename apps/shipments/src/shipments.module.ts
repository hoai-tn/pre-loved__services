import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './entity/address.entity';
import { Shipment } from './entity/shipment.entity';
import { ShipmentEvent } from './entity/shipment-event.entity';
import { ShippingProvider } from './entity/shipping-provider.entity';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './local/nodeA/.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      entities: [Address, ShippingProvider, Shipment, ShipmentEvent],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Address, ShippingProvider, Shipment, ShipmentEvent]),
  ],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
})
export class ShipmentsModule {}
