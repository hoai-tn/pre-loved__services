import {
  IInventoryCreate,
  IInventoryFindAll,
  IInventoryFindByProductId,
  IInventoryFindBySku,
  IInventoryFindOne,
  IInventoryGetLowStock,
  IInventoryRemove,
  IInventoryUpdate,
  IReleaseStockResult,
  IReserveStockResult,
  IStockCheckResult,
} from '@app/common/interfaces';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { INVENTORY_MESSAGE_PATTERNS } from 'libs/constant/message-pattern-inventory.constant';
import { NAME_SERVICE_TCP } from 'libs/constant/port-tcp.constant';
import { catchError, firstValueFrom, throwError, timeout } from 'rxjs';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import {
  CheckStockDto,
  ReleaseStockDto,
  ReserveStockDto,
} from './dto/stock-operations.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @Inject(NAME_SERVICE_TCP.INVENTORY_SERVICE)
    private readonly inventoryClient: ClientProxy,
  ) {}

  async create(data: CreateInventoryDto): Promise<IInventoryCreate> {
    this.logger.log(`Creating inventory: ${JSON.stringify(data)}`);
    return await firstValueFrom(
      this.inventoryClient
        .send<
          IInventoryCreate,
          CreateInventoryDto
        >(INVENTORY_MESSAGE_PATTERNS.INVENTORY_CREATE, data)
        .pipe(
          timeout(10000),
          catchError(err =>
            throwError(() => {
              if (err instanceof Error) {
                this.logger.error('Error creating inventory:', err);
              }
              throw err;
            }),
          ),
        ),
    );
  }

  async findAll(): Promise<IInventoryFindAll> {
    return await firstValueFrom(
      this.inventoryClient
        .send<
          IInventoryFindAll,
          Record<string, never>
        >(INVENTORY_MESSAGE_PATTERNS.INVENTORY_FIND_ALL, {})
        .pipe(
          timeout(10000),
          catchError(err =>
            throwError(() => {
              if (err instanceof Error) {
                this.logger.error('Error finding all inventory:', err);
              }
              throw err;
            }),
          ),
        ),
    );
  }

  async findOne(id: number): Promise<IInventoryFindOne> {
    return await firstValueFrom(
      this.inventoryClient
        .send<
          IInventoryFindOne,
          number
        >(INVENTORY_MESSAGE_PATTERNS.INVENTORY_FIND_ONE, id)
        .pipe(
          timeout(10000),
          catchError(err =>
            throwError(() => {
              if (err instanceof Error) {
                this.logger.error('Error finding inventory by id:', err);
              }
              throw err;
            }),
          ),
        ),
    );
  }

  async findByProductId(productId: number): Promise<IInventoryFindByProductId> {
    return await firstValueFrom(
      this.inventoryClient
        .send<
          IInventoryFindByProductId,
          number
        >(INVENTORY_MESSAGE_PATTERNS.INVENTORY_FIND_BY_PRODUCT_ID, productId)
        .pipe(
          timeout(10000),
          catchError(err =>
            throwError(() => {
              if (err instanceof Error) {
                this.logger.error(
                  'Error finding inventory by product id:',
                  err,
                );
              }
              throw err;
            }),
          ),
        ),
    );
  }

  async findBySku(sku: string): Promise<IInventoryFindBySku> {
    return await firstValueFrom(
      this.inventoryClient
        .send<
          IInventoryFindBySku,
          string
        >(INVENTORY_MESSAGE_PATTERNS.INVENTORY_FIND_BY_SKU, sku)
        .pipe(
          timeout(10000),
          catchError(err =>
            throwError(() => {
              if (err instanceof Error) {
                this.logger.error('Error finding inventory by SKU:', err);
              }
              throw err;
            }),
          ),
        ),
    );
  }

  async update(
    id: number,
    update: UpdateInventoryDto,
  ): Promise<IInventoryUpdate> {
    return await firstValueFrom(
      this.inventoryClient
        .send<
          IInventoryUpdate,
          { id: number; update: UpdateInventoryDto }
        >(INVENTORY_MESSAGE_PATTERNS.INVENTORY_UPDATE, { id, update })
        .pipe(
          timeout(10000),
          catchError(err =>
            throwError(() => {
              if (err instanceof Error) {
                this.logger.error('Error updating inventory:', err);
              }
              throw err;
            }),
          ),
        ),
    );
  }

  async remove(id: number): Promise<IInventoryRemove> {
    return await firstValueFrom(
      this.inventoryClient
        .send<
          IInventoryRemove,
          number
        >(INVENTORY_MESSAGE_PATTERNS.INVENTORY_REMOVE, id)
        .pipe(timeout(10000)),
    );
  }

  async checkStock(dto: CheckStockDto): Promise<IStockCheckResult> {
    return await firstValueFrom(
      this.inventoryClient
        .send<
          IStockCheckResult,
          CheckStockDto
        >(INVENTORY_MESSAGE_PATTERNS.INVENTORY_CHECK_STOCK, dto)
        .pipe(timeout(10000)),
    );
  }

  async reserveStock(dto: ReserveStockDto): Promise<IReserveStockResult> {
    return await firstValueFrom(
      this.inventoryClient
        .send<
          IReserveStockResult,
          ReserveStockDto
        >(INVENTORY_MESSAGE_PATTERNS.INVENTORY_RESERVE_STOCK, dto)
        .pipe(timeout(10000)),
    );
  }

  async releaseStock(dto: ReleaseStockDto): Promise<IReleaseStockResult> {
    return await firstValueFrom(
      this.inventoryClient
        .send<
          IReleaseStockResult,
          ReleaseStockDto
        >(INVENTORY_MESSAGE_PATTERNS.INVENTORY_RELEASE_STOCK, dto)
        .pipe(timeout(10000)),
    );
  }

  async getLowStock(): Promise<IInventoryGetLowStock> {
    return await firstValueFrom(
      this.inventoryClient
        .send<
          IInventoryGetLowStock,
          Record<string, never>
        >(INVENTORY_MESSAGE_PATTERNS.INVENTORY_GET_LOW_STOCK, {})
        .pipe(timeout(10000)),
    );
  }
}
