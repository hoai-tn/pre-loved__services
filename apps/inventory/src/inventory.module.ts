import { RmqModule } from '@app/common';
import { PostgresDatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entity/inventory.entity';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [
    RmqModule.register({ name: 'INVENTORY_SERVICE' }),
    PostgresDatabaseModule,
    TypeOrmModule.forFeature([Inventory]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
