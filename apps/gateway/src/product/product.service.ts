import {
  BrandResponseDto,
  CategoryResponseDto,
  CreateProductResponseDto,
  FindAllProductsResponseDto,
  ProductResponseDto,
  UserResponseDto,
} from '@app/common/dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { INVENTORY_MESSAGE_PATTERNS } from 'libs/constant/message-pattern-inventory.constant';
import { PRODUCT_MESSAGE_PATTERNS } from 'libs/constant/message-pattern-product.constant';
import { USER_MESSAGE_PATTERN } from 'libs/constant/message-pattern.constant';
import { NAME_SERVICE_TCP } from 'libs/constant/port-tcp.constant';
import { catchError, firstValueFrom, throwError, timeout } from 'rxjs';
import { MicroserviceErrorHandler } from '../common/microservice-error.handler';
import {
  CreateBrandDto,
  CreateCategoryDto,
  CreateProductDto,
  GetProductsQueryDto,
  UpdateProductDto,
} from './dto/product-simple.dto';

export interface InventoryData {
  id: number;
  productId: number;
  sku: string;
  availableStock: number;
  reservedStock: number;
  minimumStock: number;
  location?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  totalStock?: number;
  isLowStock?: boolean;
  stockStatus?: string;
  lastUpdated?: Date;
}

export interface ProductWithInventory extends ProductResponseDto {
  // User information
  user?: {
    id: number;
    name: string;
    email?: string;
    avatar?: string;
  } | null;

  // Inventory fields
  inventory?: InventoryData | null;
}

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  constructor(
    @Inject(NAME_SERVICE_TCP.PRODUCT_SERVICE)
    private readonly productClient: ClientProxy,
    @Inject(NAME_SERVICE_TCP.INVENTORY_SERVICE)
    private readonly inventoryClient: ClientProxy,
    @Inject(NAME_SERVICE_TCP.USER_SERVICE)
    private readonly userClient: ClientProxy,
  ) {}

  // ============================================================================
  // PRODUCT OPERATIONS
  // ============================================================================

  async createProduct(
    dto: CreateProductDto,
  ): Promise<CreateProductResponseDto | undefined> {
    try {
      this.logger.log(`Creating product with SKU: ${dto.sku}`);
      const response = await firstValueFrom<CreateProductResponseDto>(
        this.productClient
          .send<CreateProductResponseDto>(
            PRODUCT_MESSAGE_PATTERNS.PRODUCT_CREATE,
            dto,
          )
          .pipe(
            timeout(10000),
            catchError((error: unknown) => {
              this.logger.error('Error creating product:', error);
              return throwError(() => error);
            }),
          ),
      );
      return response;
    } catch (error) {
      MicroserviceErrorHandler.handleError(
        error,
        'create product',
        'Product Service',
      );
    }
  }

  async getAllProducts(
    query: GetProductsQueryDto,
  ): Promise<
    | Array<ProductResponseDto & { user?: Partial<UserResponseDto> | null }>
    | undefined
  > {
    try {
      this.logger.log(
        `Fetching all products with query: ${JSON.stringify(query)}`,
      );
      const response = await firstValueFrom<FindAllProductsResponseDto>(
        this.productClient
          .send<FindAllProductsResponseDto>(
            PRODUCT_MESSAGE_PATTERNS.PRODUCT_FIND_ALL,
            query,
          )
          .pipe(
            timeout(10000),
            catchError((error: unknown) => throwError(() => error)),
          ),
      );

      // Extract products from response structure
      const products = response.items;
      this.logger.debug(
        `Extracted products type: ${typeof products}, isArray: ${Array.isArray(products)}, length: ${products?.length || 0}`,
      );

      // Enrich products with user information
      const enrichedProducts = await this.enrichProductsWithUserInfo(products);

      this.logger.log(
        `Found ${enrichedProducts?.length || 0} products with user info`,
      );
      return enrichedProducts;
    } catch (error) {
      MicroserviceErrorHandler.handleError(
        error,
        'fetch products',
        'Product Service',
      );
    }
  }

  async getProductById(
    id: number,
  ): Promise<
    | (ProductResponseDto & { user?: Partial<UserResponseDto> | null })
    | undefined
  > {
    try {
      this.logger.log(`Fetching product by ID: ${id}`);
      const response = await firstValueFrom<ProductResponseDto>(
        this.productClient
          .send<ProductResponseDto>(
            PRODUCT_MESSAGE_PATTERNS.PRODUCT_FIND_BY_ID,
            id,
          )
          .pipe(
            timeout(10000),
            catchError(error => throwError(() => error)),
          ),
      );

      this.logger.debug(
        `Product ${id} response:`,
        response ? 'found' : 'not found',
      );

      // Enrich with user information
      return await this.enrichProductWithUserInfo(response);
    } catch (error) {
      MicroserviceErrorHandler.handleError(
        error,
        `fetch product by ID: ${id}`,
        'Product Service',
      );
    }
  }

  async getProductBySku(sku: string): Promise<ProductResponseDto | undefined> {
    try {
      return await firstValueFrom<ProductResponseDto>(
        this.productClient
          .send<ProductResponseDto>(
            PRODUCT_MESSAGE_PATTERNS.PRODUCT_FIND_BY_SKU,
            sku,
          )
          .pipe(
            timeout(10000),
            catchError(error => throwError(() => error)),
          ),
      );
    } catch (error) {
      MicroserviceErrorHandler.handleError(
        error,
        `fetch product by SKU: ${sku}`,
        'Product Service',
      );
    }
  }

  async updateProduct(
    id: number,
    dto: UpdateProductDto,
  ): Promise<ProductResponseDto | undefined> {
    try {
      return await firstValueFrom<ProductResponseDto>(
        this.productClient
          .send<ProductResponseDto>(PRODUCT_MESSAGE_PATTERNS.PRODUCT_UPDATE, {
            id,
            updateProductDto: dto,
          })
          .pipe(
            timeout(10000),
            catchError(error => throwError(() => error)),
          ),
      );
    } catch (error) {
      MicroserviceErrorHandler.handleError(
        error,
        `update product ID: ${id}`,
        'Product Service',
      );
    }
  }

  async deleteProduct(id: number): Promise<void> {
    await firstValueFrom<void>(
      this.productClient.send<void>(
        PRODUCT_MESSAGE_PATTERNS.PRODUCT_DELETE,
        id,
      ),
    );
  }

  async getProductsByCategory(
    categoryId: number,
    query: GetProductsQueryDto,
  ): Promise<FindAllProductsResponseDto> {
    return await firstValueFrom<FindAllProductsResponseDto>(
      this.productClient.send<FindAllProductsResponseDto>(
        PRODUCT_MESSAGE_PATTERNS.PRODUCT_FIND_BY_CATEGORY,
        { categoryId, query },
      ),
    );
  }

  async getProductsByBrand(
    brandId: number,
    query: GetProductsQueryDto,
  ): Promise<FindAllProductsResponseDto> {
    return await firstValueFrom<FindAllProductsResponseDto>(
      this.productClient.send<FindAllProductsResponseDto>(
        PRODUCT_MESSAGE_PATTERNS.PRODUCT_FIND_BY_BRAND,
        {
          brandId,
          query,
        },
      ),
    );
  }

  async searchProducts(
    query: GetProductsQueryDto,
  ): Promise<FindAllProductsResponseDto> {
    return await firstValueFrom<FindAllProductsResponseDto>(
      this.productClient.send<FindAllProductsResponseDto>(
        PRODUCT_MESSAGE_PATTERNS.PRODUCT_SEARCH,
        query,
      ),
    );
  }

  // ============================================================================
  // BRAND OPERATIONS
  // ============================================================================

  async createBrand(dto: CreateBrandDto): Promise<BrandResponseDto> {
    return await firstValueFrom<BrandResponseDto>(
      this.productClient.send<BrandResponseDto>(
        PRODUCT_MESSAGE_PATTERNS.BRAND_CREATE,
        dto,
      ),
    );
  }

  async getAllBrands(): Promise<BrandResponseDto[]> {
    return await firstValueFrom<BrandResponseDto[]>(
      this.productClient.send<BrandResponseDto[]>(
        PRODUCT_MESSAGE_PATTERNS.BRAND_FIND_ALL,
        {},
      ),
    );
  }

  async getBrandById(id: number): Promise<BrandResponseDto> {
    return await firstValueFrom<BrandResponseDto>(
      this.productClient.send<BrandResponseDto>(
        PRODUCT_MESSAGE_PATTERNS.BRAND_FIND_BY_ID,
        id,
      ),
    );
  }

  // ============================================================================
  // CATEGORY OPERATIONS
  // ============================================================================

  async createCategory(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return await firstValueFrom<CategoryResponseDto>(
      this.productClient.send<CategoryResponseDto>(
        PRODUCT_MESSAGE_PATTERNS.CATEGORY_CREATE,
        dto,
      ),
    );
  }

  async getAllCategories(): Promise<CategoryResponseDto[]> {
    try {
      this.logger.log('Fetching all categories');
      const result = await firstValueFrom<CategoryResponseDto[]>(
        this.productClient.send<CategoryResponseDto[]>(
          PRODUCT_MESSAGE_PATTERNS.CATEGORY_FIND_ALL,
          {},
        ),
      );
      this.logger.log(`Found ${result?.length || 0} categories`);
      return result;
    } catch (error) {
      this.logger.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  async getCategoryById(id: number): Promise<CategoryResponseDto> {
    return await firstValueFrom<CategoryResponseDto>(
      this.productClient.send<CategoryResponseDto>(
        PRODUCT_MESSAGE_PATTERNS.CATEGORY_FIND_BY_ID,
        id,
      ),
    );
  }

  // ============================================================================
  // AGGREGATOR OPERATIONS - PRODUCT + INVENTORY
  // ============================================================================

  async getProductWithInventoryById(
    productId: number,
  ): Promise<ProductWithInventory | null> {
    try {
      this.logger.debug(`Aggregating data for product ID: ${productId}`);

      // Fetch product and inventory data in parallel (Aggregator Pattern)
      const [product, inventory] = await Promise.all([
        this.getProductById(productId).catch((err: unknown) => {
          const errorMessage = err instanceof Error ? err.message : String(err);
          this.logger.warn(
            `Product service error for ID ${productId}: ${errorMessage}`,
          );
          return null;
        }),
        firstValueFrom<InventoryData | null>(
          this.inventoryClient.send<InventoryData>(
            INVENTORY_MESSAGE_PATTERNS.INVENTORY_FIND_BY_PRODUCT_ID,
            productId,
          ),
        ).catch((err: unknown) => {
          const errorMessage = err instanceof Error ? err.message : String(err);
          this.logger.warn(
            `Inventory service error for product ID ${productId}: ${errorMessage}`,
          );
          return null;
        }),
      ]);

      // If product doesn't exist, return null
      if (!product) {
        this.logger.debug(`Product not found for ID: ${productId}`);
        return null;
      }

      // Enrich product with user information
      const enrichedProduct = await this.enrichProductWithUserInfo(product);

      // Data aggregation and enrichment
      const result: ProductWithInventory = {
        ...enrichedProduct,
        user:
          enrichedProduct.user && enrichedProduct.user.id
            ? {
                id: enrichedProduct.user.id,
                name:
                  enrichedProduct.user.name ||
                  enrichedProduct.user.username ||
                  '',
                email: enrichedProduct.user.email,
                avatar: enrichedProduct.user.avatar,
              }
            : null,
        inventory: inventory ? this.enrichInventoryData(inventory) : null,
      };

      this.logger.debug(
        `Successfully aggregated data for product ID: ${productId}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Aggregation failed for product ID ${productId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Enrich inventory data with computed fields
   * This is part of the aggregation process
   */
  private enrichInventoryData(inventory: InventoryData): InventoryData {
    return {
      ...inventory,
      totalStock: inventory.availableStock + inventory.reservedStock,
      isLowStock: inventory.availableStock <= inventory.minimumStock,
      stockStatus: this.getStockStatus(inventory),
      lastUpdated: inventory.updatedAt || new Date(),
    };
  }

  /**
   * Business logic for stock status
   */
  private getStockStatus(inventory: InventoryData): string {
    if (inventory.availableStock === 0) return 'OUT_OF_STOCK';
    if (inventory.availableStock <= inventory.minimumStock) return 'LOW_STOCK';
    if (inventory.availableStock > inventory.minimumStock * 3)
      return 'IN_STOCK';
    return 'NORMAL_STOCK';
  }

  async getProductsWithInventory(
    productIds: number[],
  ): Promise<ProductWithInventory[]> {
    try {
      if (!productIds || productIds.length === 0) {
        return [];
      }

      // Fetch products and inventory data in parallel
      const [products, inventoryItems] = await Promise.all([
        Promise.all(productIds.map(id => this.getProductById(id))),
        firstValueFrom(
          this.inventoryClient.send<InventoryData[]>(
            INVENTORY_MESSAGE_PATTERNS.INVENTORY_GET_BY_PRODUCT_IDS,
            productIds,
          ),
        ),
      ]);

      // Create inventory map for quick lookup
      const inventoryMap = new Map<number, InventoryData>();
      if (inventoryItems && Array.isArray(inventoryItems)) {
        inventoryItems.forEach(item => {
          inventoryMap.set(item.productId, {
            ...item,
            totalStock: item.availableStock + item.reservedStock,
            isLowStock: item.availableStock <= item.minimumStock,
          });
        });
      }

      // Enrich products with user information
      const validProducts: ProductResponseDto[] = products.filter(
        (product): product is ProductResponseDto =>
          product !== null && product !== undefined,
      );
      const enrichedProducts =
        await this.enrichProductsWithUserInfo(validProducts);

      // Combine products with their inventory data
      const results: ProductWithInventory[] = enrichedProducts.map(product => ({
        ...product,
        user:
          product.user && product.user.id
            ? {
                id: product.user.id,
                name: product.user.name || product.user.username || '',
                email: product.user.email,
                avatar: product.user.avatar,
              }
            : null,
        inventory: inventoryMap.get(product.id) || null,
      }));

      return results;
    } catch (error) {
      this.logger.error(`Error fetching products with inventory:`, error);
      throw error;
    }
  }

  async getAllProductsWithInventory(
    query: GetProductsQueryDto,
  ): Promise<ProductWithInventory[]> {
    try {
      // Fetch all products first
      const products = await this.getAllProducts(query);

      if (!products || products.length === 0) {
        return [];
      }

      // Extract product IDs
      const productIds = products.map(product => product.id);

      // Fetch inventory data for all products
      const inventoryItems = await firstValueFrom<InventoryData[]>(
        this.inventoryClient.send<InventoryData[]>(
          INVENTORY_MESSAGE_PATTERNS.INVENTORY_GET_BY_PRODUCT_IDS,
          productIds,
        ),
      );

      // Create inventory map
      const inventoryMap = new Map<number, InventoryData>();
      if (inventoryItems && Array.isArray(inventoryItems)) {
        inventoryItems.forEach(item => {
          inventoryMap.set(item.productId, {
            ...item,
            totalStock: item.availableStock + item.reservedStock,
            isLowStock: item.availableStock <= item.minimumStock,
          });
        });
      }

      // Combine products with inventory (products already have user info from getAllProducts)
      const results: ProductWithInventory[] = products.map(product => ({
        ...product,
        user:
          product.user && product.user.id
            ? {
                id: product.user.id,
                name: product.user.name || product.user.username || '',
                email: product.user.email,
                avatar: product.user.avatar,
              }
            : null,
        inventory: inventoryMap.get(product.id) || null,
      }));

      return results;
    } catch (error) {
      this.logger.error(`Error fetching all products with inventory:`, error);
      throw error;
    }
  }

  async checkProductStock(
    productId: number,
    quantity: number,
  ): Promise<{ available: boolean; currentStock: number }> {
    try {
      return await firstValueFrom<{ available: boolean; currentStock: number }>(
        this.inventoryClient.send<{ available: boolean; currentStock: number }>(
          INVENTORY_MESSAGE_PATTERNS.INVENTORY_CHECK_STOCK,
          { productId, quantity },
        ),
      );
    } catch (error) {
      this.logger.error(
        `Error checking stock for product ${productId}:`,
        error,
      );
      throw error;
    }
  }

  // ============================================================================
  // USER INFORMATION ENRICHMENT
  // ============================================================================

  /**
   * Enrich single product with user information
   */
  private async enrichProductWithUserInfo(
    product: ProductResponseDto,
  ): Promise<ProductResponseDto & { user?: Partial<UserResponseDto> | null }> {
    if (!product || !product.userId) {
      this.logger.debug(
        `Skipping user enrichment for product: ${product?.id || 'unknown'}`,
      );
      return product;
    }

    try {
      const userId = product.userId;
      if (!userId || typeof userId !== 'number') {
        this.logger.warn(
          `Invalid userId for product ${product.id}: ${product.userId}`,
        );
        return product;
      }

      this.logger.debug(`Fetching single user info for userId: ${userId}`);
      const user = await firstValueFrom<UserResponseDto | null>(
        this.userClient
          .send({ cmd: USER_MESSAGE_PATTERN.GET_USER_INFO }, userId)
          .pipe(
            timeout(5000),
            catchError(error => {
              this.logger.warn(
                `Failed to fetch user info for userId: ${userId}`,
                error,
              );
              return throwError(() => null);
            }),
          ),
      );
      this.logger.debug(`Single user response for userId ${userId}:`, user);

      return {
        ...product,
        user:
          user && user.id
            ? {
                id: user.id,
                name: user.name || user.username || '',
                email: user.email,
                avatar: user.avatar,
              }
            : null,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.debug(
        `User enrichment failed for product ${product.id}, userId: ${product.userId}`,
        errorMessage,
      );
      // Return product without user info if user service fails
      return product;
    }
  }

  /**
   * Enrich multiple products with user information
   */
  private async enrichProductsWithUserInfo(
    products: FindAllProductsResponseDto['items'],
  ): Promise<
    Array<ProductResponseDto & { user?: Partial<UserResponseDto> | null }>
  > {
    // Validate input is array
    if (!Array.isArray(products) || products.length === 0) {
      this.logger.debug('Invalid or empty products array for user enrichment');
      return [];
    }

    try {
      // Get unique user IDs
      const userIds = [
        ...new Set(
          products
            .filter(
              product =>
                product && product.userId && typeof product.userId === 'number',
            )
            .map(product => product.userId!),
        ),
      ];

      if (userIds.length === 0) {
        return products;
      }

      // Fetch user information for all unique user IDs
      this.logger.debug(
        `Fetching user info for userIds: ${JSON.stringify(userIds)}`,
      );
      const users = await Promise.all(
        userIds.map(async userId => {
          try {
            this.logger.debug(`Calling User service for userId: ${userId}`);
            const user = await firstValueFrom<UserResponseDto | null>(
              this.userClient
                .send({ cmd: USER_MESSAGE_PATTERN.GET_USER_INFO }, userId)
                .pipe(
                  timeout(5000),
                  catchError(error => {
                    this.logger.warn(
                      `Failed to fetch user info for userId: ${userId}`,
                      error,
                    );
                    return throwError(() => null);
                  }),
                ),
            );
            this.logger.debug(
              `User service response for userId ${userId}:`,
              user,
            );
            return { userId, user };
          } catch (error) {
            this.logger.error(`Error fetching user ${userId}:`, error);
            return { userId, user: null };
          }
        }),
      );

      // Create user map for quick lookup
      const userMap = new Map<
        number,
        { id: number; name: string; email?: string; avatar?: string }
      >();
      users.forEach(({ userId, user }) => {
        if (user && user.id) {
          userMap.set(userId, {
            id: user.id,
            name: user.name || user.username || '',
            email: user.email,
            avatar: user.avatar,
          });
        }
      });

      // Enrich products with user information
      return products.map(product => ({
        ...product,
        user: product.userId ? userMap.get(product.userId) || null : null,
      }));
    } catch (error) {
      this.logger.error('Error enriching products with user info:', error);
      // Return original products if enrichment fails
      return products;
    }
  }
}
