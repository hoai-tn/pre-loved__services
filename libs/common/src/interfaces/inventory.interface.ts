import { Inventory } from 'apps/inventory/src/inventory.entity';

/**
 * Response type for inventory create operation
 */
export type IInventoryCreate = Inventory;

/**
 * Response type for inventory update operation
 */
export type IInventoryUpdate = Inventory;

/**
 * Response type for inventory findOne operation
 */
export type IInventoryFindOne = Inventory | null;

/**
 * Response type for inventory findAll operation
 */
export type IInventoryFindAll = Inventory[];

/**
 * Response type for inventory findByProductId operation
 */
export type IInventoryFindByProductId = Inventory | null;

/**
 * Response type for inventory findBySku operation
 */
export type IInventoryFindBySku = Inventory | null;

/**
 * Response type for inventory getByProductIds operation
 */
export type IInventoryGetByProductIds = Inventory[];

/**
 * Response type for inventory remove operation
 */
export type IInventoryRemove = boolean;

/**
 * Response type for inventory getLowStock operation
 */
export type IInventoryGetLowStock = Inventory[];

/**
 * Response type for stock check operation
 */
export interface IStockCheckResult {
  productId: number;
  sku: string;
  available: boolean;
  availableStock: number;
  requestedQuantity: number;
}

/**
 * Response type for reserve stock operation
 */
export type IReserveStockResult = boolean;

/**
 * Response type for release stock operation
 */
export type IReleaseStockResult = boolean;

/**
 * Response type for consume reserved stock operation
 */
export type IConsumeReservedStockResult = boolean;
