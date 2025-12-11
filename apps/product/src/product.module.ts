import { RmqModule } from '@app/common';
import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entity/brand.entity';
import { Category } from './entity/category.entity';
import { Product } from './entity/product.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Product, Brand, Category]),
    RmqModule.register({ name: 'INVENTORY_SERVICE' }),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
