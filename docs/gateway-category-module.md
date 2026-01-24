# Category Module - Gateway Implementation

## Overview

This document describes the implementation of the standalone `/api/category` endpoint in the Gateway service. The Category module provides a REST API interface for managing product categories.

## Architecture

### Communication Flow

```
HTTP Client → Gateway (REST) → Product Service (TCP) → Database
```

1. **Gateway Controller** receives HTTP requests at `/api/category`
2. **Gateway Service** transforms REST to TCP messages
3. **Product Service** handles business logic and database operations
4. Gateway returns response to client

## File Structure

```
apps/gateway/src/category/
├── dto/
│   ├── create-category.dto.ts      # Create category validation
│   ├── update-category.dto.ts      # Update category validation
│   └── query-category.dto.ts       # Query parameters validation
├── category.module.ts               # Module registration
├── category.controller.ts           # REST endpoints
└── category.service.ts             # TCP client communication
```

## Endpoints

### Base URL: `/api/category`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all categories | No |
| POST | `/` | Create new category | Optional* |
| GET | `/:id` | Get category by ID | No |
| PATCH | `/:id` | Update category | Optional* |
| DELETE | `/:id` | Delete category | Optional* |

*Note: Currently public, but can add `@UseGuards(JwtAuthGuard)` for authentication.

## Implementation Details

### 1. Module Setup

**apps/gateway/src/category/category.module.ts**

```typescript
import { Module, forwardRef } from '@nestjs/common';
import { GatewayModule } from '../gateway.module';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
  imports: [forwardRef(() => GatewayModule)],  // Access TCP clients
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
```

**Key Points:**

- Uses `forwardRef(() => GatewayModule)` to access registered TCP clients
- Exports service for potential use in other modules

### 2. Controller Implementation

**apps/gateway/src/category/category.controller.ts**

```typescript
@ApiTags('Categories')
@Controller('category')  // Routes: /api/category
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  async getAllCategories(@Query() query: QueryCategoryDto) {
    return await this.categoryService.getAllCategories();
  }

  @Post()
  @ApiOperation({ summary: 'Create new category' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return await this.categoryService.createCategory(dto);
  }

  // ... other endpoints
}
```

**Key Points:**

- Uses Swagger decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`)
- Validates input with DTOs
- Delegates business logic to service layer
- Uses `ParseIntPipe` for ID parameter validation

### 3. Service Implementation

**apps/gateway/src/category/category.service.ts**

```typescript
@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @Inject(NAME_SERVICE_TCP.PRODUCT_SERVICE)
    private readonly productClient: ClientProxy,
  ) {}

  async getAllCategories() {
    return await firstValueFrom(
      this.productClient
        .send(PRODUCT_MESSAGE_PATTERNS.CATEGORY_FIND_ALL, {})
        .pipe(
          timeout(5000),
          catchError((error) => throwError(() => error)),
        ),
    );
  }
}
```

**Key Points:**

- Injects `PRODUCT_SERVICE` TCP client via dependency injection
- Uses `firstValueFrom` to convert RxJS Observable to Promise
- Implements timeout (5 seconds) for microservice calls
- Comprehensive logging for debugging
- Error handling with try-catch and RxJS operators

### 4. DTOs

**create-category.dto.ts**

```typescript
export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Electronics' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Category description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Category active status', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

**Key Points:**

- Uses `class-validator` decorators for validation
- Swagger decorators for API documentation
- Optional fields have default values

## Message Patterns

**libs/constant/message-pattern-product.constant.ts**

```typescript
export const PRODUCT_MESSAGE_PATTERNS = {
  // Category patterns
  CATEGORY_CREATE: 'category.create',
  CATEGORY_FIND_ALL: 'category.findAll',
  CATEGORY_FIND_BY_ID: 'category.findById',
  CATEGORY_UPDATE: 'category.update',
  CATEGORY_DELETE: 'category.delete',
} as const;
```

## Backend Service Integration

### Product Service Handlers

**apps/product/src/product.controller.ts**

```typescript
@Controller()
export class ProductController {
  @MessagePattern(PRODUCT_MESSAGE_PATTERNS.CATEGORY_CREATE)
  async createCategory(@Payload() createCategoryDto: CreateCategoryDto) {
    return this.productService.createCategory(createCategoryDto);
  }

  @MessagePattern(PRODUCT_MESSAGE_PATTERNS.CATEGORY_UPDATE)
  async updateCategory(@Payload() data: { id: number; ... }) {
    const { id, ...updateCategoryDto } = data;
    return this.productService.updateCategory(id, updateCategoryDto);
  }
  
  // ... other handlers
}
```

**apps/product/src/product.service.ts**

```typescript
async updateCategory(id: number, updateCategoryDto: Partial<CreateCategoryDto>): Promise<Category> {
  const category = await this.findCategoryById(id);
  Object.assign(category, updateCategoryDto);
  return this.categoryRepository.save(category);
}

async deleteCategory(id: number): Promise<{ message: string }> {
  const category = await this.findCategoryById(id);
  await this.categoryRepository.remove(category);
  return { message: `Category with ID ${id} deleted successfully` };
}
```

## Module Registration

**apps/gateway/src/gateway.module.ts**

```typescript
@Module({
  imports: [
    ClientsModule.register([/* TCP clients */]),
    InventoryModule,
    UserModule,
    OrderModule,
    ProductModule,
    CategoryModule,  // ← Added here
    CachedModule,
  ],
  // ...
})
export class GatewayModule {}
```

## Testing

### Manual Testing with REST Client

Create a file: `rest/category.rest.http`

```http
### Get all categories
GET http://localhost:3000/api/category

### Create category
POST http://localhost:3000/api/category
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "isActive": true
}

### Get category by ID
GET http://localhost:3000/api/category/1

### Update category
PATCH http://localhost:3000/api/category/1
Content-Type: application/json

{
  "name": "Updated Electronics",
  "description": "Updated description"
}

### Delete category
DELETE http://localhost:3000/api/category/1
```

## Error Handling

### Standard Error Responses

```json
{
  "statusCode": 404,
  "message": "Category not found",
  "error": "Not Found"
}
```

### Common Error Codes

- `400` - Bad Request (invalid input)
- `404` - Not Found (category doesn't exist)
- `500` - Internal Server Error (service communication failure)

## Adding Authentication (Optional)

To require authentication for certain endpoints:

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('category')
export class CategoryController {
  @Post()
  @UseGuards(JwtAuthGuard)  // ← Add this
  async createCategory(@Body() dto: CreateCategoryDto) {
    // ...
  }
}
```

## Future Enhancements

1. **Pagination** - Add pagination for `GET /api/category`
2. **Search/Filter** - Implement query parameters for filtering
3. **Bulk Operations** - Add endpoints for bulk create/update/delete
4. **Category Tree** - Support hierarchical categories (parent/child)
5. **Caching** - Add Redis caching for frequently accessed categories
6. **Rate Limiting** - Implement rate limiting for public endpoints

## Pattern for Adding New Resources

To add a new resource (e.g., `/api/brands`), follow this pattern:

1. **Create module structure:**

   ```
   apps/gateway/src/[resource]/
   ├── dto/
   ├── [resource].module.ts
   ├── [resource].controller.ts
   └── [resource].service.ts
   ```

2. **Define message patterns** in `libs/constant/message-pattern-*.constant.ts`

3. **Implement controller** with `@Controller('[resource]')`

4. **Implement service** with TCP client injection

5. **Register module** in `gateway.module.ts`

6. **Ensure backend service** has message handlers

## Best Practices

✅ **Always use DTOs** for request validation  
✅ **Use constants** for message patterns (never hardcode)  
✅ **Add Swagger documentation** to all endpoints  
✅ **Implement proper error handling** with try-catch and RxJS operators  
✅ **Add logging** for debugging and monitoring  
✅ **Set timeouts** for microservice calls (default: 5 seconds)  
✅ **Use TypeScript types** for type safety  
✅ **Follow NestJS conventions** (modules, controllers, services)

## Troubleshooting

### Issue: "Cannot connect to microservice"

**Solution:** Ensure product service is running and TCP port matches:

```bash
npm run start:product
```

### Issue: "Timeout error"

**Solution:** Increase timeout or check product service performance:

```typescript
.pipe(timeout(10000))  // Increase to 10 seconds
```

### Issue: "Module not registered"

**Solution:** Verify CategoryModule is imported in `gateway.module.ts`

## References

- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [NestJS Controllers](https://docs.nestjs.com/controllers)
- [Class Validator](https://github.com/typestack/class-validator)
- [Swagger/OpenAPI](https://docs.nestjs.com/openapi/introduction)
