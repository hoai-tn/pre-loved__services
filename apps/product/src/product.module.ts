import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NAME_SERVICE_TCP, PORT_TCP } from 'libs/constant/port-tcp.constant';
import { Brand } from './entity/brand.entity';
import { Category } from './entity/category.entity';
import { Product } from './entity/product.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Product, Brand, Category]),
    // RmqModule.register({ name: 'INVENTORY_SERVICE' }),
    ClientsModule.register([
      {
        name: NAME_SERVICE_TCP.INVENTORY_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: PORT_TCP.INVENTORY_TCP_PORT,
        },
      },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
