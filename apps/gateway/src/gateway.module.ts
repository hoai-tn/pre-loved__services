import { CachedModule } from '@app/cached';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NAME_SERVICE_TCP, PORT_TCP } from 'libs/constant/port-tcp.constant';
import { AuthOauthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import {
  FacebookStrategy,
  GoogleStrategy,
  JwtStrategy,
  LocalStrategy,
} from './common/strategies';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { InventoryModule } from './inventory/inventory.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { ShipmentModule } from './shipment/shipment.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './local/nodeA/.env',
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ClientsModule.register([
      {
        name: NAME_SERVICE_TCP.ORDERS_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: PORT_TCP.ORDERS_TCP_PORT,
        },
      },
      {
        name: NAME_SERVICE_TCP.INVENTORY_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: PORT_TCP.INVENTORY_TCP_PORT,
        },
      },
      {
        name: NAME_SERVICE_TCP.USER_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: PORT_TCP.USER_TCP_PORT,
        },
      },
      {
        name: NAME_SERVICE_TCP.PRODUCT_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: PORT_TCP.PRODUCT_TCP_PORT,
        },
      },
      {
        name: NAME_SERVICE_TCP.AUTH_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: PORT_TCP.AUTH_TCP_PORT,
        },
      },
      {
        name: NAME_SERVICE_TCP.SHIPMENTS_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: PORT_TCP.SHIPMENTS_TCP_PORT,
        },
      },
    ]),
    InventoryModule,
    UserModule,
    OrderModule,
    ProductModule,
    CategoryModule,
    ShipmentModule,
    CachedModule,
    AuthOauthModule,
  ],
  controllers: [GatewayController],
  providers: [
    GatewayService,
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    FacebookStrategy,
  ],
  exports: [ClientsModule, PassportModule],
})
export class GatewayModule {}
