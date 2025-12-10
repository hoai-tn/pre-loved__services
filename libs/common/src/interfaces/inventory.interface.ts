import { Inventory } from 'apps/inventory/src/inventory.entity';

export type IInventory = Omit<Inventory, 'createdAt' | 'updatedAt'>;
