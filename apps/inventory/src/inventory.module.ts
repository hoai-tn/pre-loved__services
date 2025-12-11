import { RmqModule } from '@app/common';
import { PostgresDatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { Inventory } from './inventory.entity';
import { InventoryService } from './inventory.service';

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   isGlobal: true,
    //   envFilePath: './local/nodeB/.env',
    // }),
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.PG_HOST || 'localhost',
    //   port: parseInt(process.env.PG_PORT ? process.env.PG_PORT : '5432', 10),
    //   username: process.env.PG_USERNAME || 'postgres',
    //   password: process.env.PG_PASSWORD || 'postgres',
    //   database: process.env.PG_DATABASE || 'inventory',
    //   ssl: { rejectUnauthorized: false },
    //   entities: [Inventory],
    //   synchronize: true, // Chỉ dùng cho dev, không nên dùng production
    // }),
    RmqModule.register({ name: 'INVENTORY_SERVICE' }),
    PostgresDatabaseModule,
    TypeOrmModule.forFeature([Inventory]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
