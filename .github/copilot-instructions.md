# GitHub Copilot Instructions for Pre-Loved API

## Project Overview

This is a **NestJS microservices-based e-commerce platform** for managing pre-loved/second-hand products. The architecture follows domain-driven design with event-driven communication between services.

## Architecture Patterns

### Microservices Structure

- **Gateway**: API Gateway - Entry point for all client requests (HTTP REST)
- **Auth**: Authentication/Authorization - JWT-based auth, user sessions
- **User**: User Management - User profiles, preferences
- **Product**: Product Catalog - Product listings, details, social features
- **Orders**: Order Processing - Order lifecycle, status management
- **Inventory**: Stock Management - Real-time inventory tracking
- **Payments**: Payment Processing - Payment transactions, webhooks
- **Rewards**: Loyalty Program - Points, rewards redemption

### Communication Patterns

- **Gateway → Services**: REST to TCP/RabbitMQ transformation
- **Inter-Service**: RabbitMQ message queues with message patterns
- **Response Format**: Standardized with `ApiResponse<T>` wrapper
- **Error Handling**: Custom RPC exception filters for microservice errors

### Technology Stack

- **Framework**: NestJS with TypeScript
- **Message Broker**: RabbitMQ (amqp-connection-manager)
- **Databases**:
  - MySQL 8.0 (Orders service)
  - PostgreSQL 15 (Inventory service)
- **ORM**: TypeORM with repository pattern
- **Caching**: Redis for session management
- **Logging**: Elasticsearch + Logstash
- **API Docs**: Swagger/OpenAPI

## Build, Test, and Lint Commands

### Running Services
```bash
# Development - Single service
npm run start:gateway
npm run start:orders
npm run start:user
npm run start:product
npm run start:auth
npm run start:inventory
npm run start:payments
npm run start:rewards

# Development - Multiple services
npm run start:nodeA   # Gateway, Orders, User, Product, Auth
npm run start:nodeB   # Inventory, Payments, Rewards

# Build and Production
npm run build
npm run start:prod
./scripts/start-nodeA-prod.sh
./scripts/start-nodeB-prod.sh
```

### Testing
```bash
npm run test              # Run all unit tests
npm run test:watch        # Run tests in watch mode
npm run test:cov          # Run tests with coverage
npm run test:e2e          # Run end-to-end tests
npm run test:debug        # Debug tests

# Run specific test file
npm run test -- path/to/file.spec.ts

# Run tests for specific service
npm run test -- apps/product
```

### Linting and Formatting
```bash
npm run lint              # Run ESLint with auto-fix
npm run format            # Format code with Prettier
```

## Coding Standards

### NestJS Best Practices

```typescript
// Use dependency injection
constructor(
  private readonly serviceClient: ClientProxy,
  @Inject('REDIS') private readonly redis: Redis,
) {}

// Gateway controllers delegate to microservices via ClientProxy
@Controller('products')
export class ProductController {
  constructor(@Inject(NAME_SERVICE_TCP.PRODUCT_SERVICE) private readonly client: ClientProxy) {}
  
  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.client.send(PRODUCT_MESSAGE_PATTERNS.PRODUCT_CREATE, dto);
  }
}

// Microservice controllers handle message patterns
@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  
  @MessagePattern(PRODUCT_MESSAGE_PATTERNS.PRODUCT_CREATE)
  async createProduct(@Payload() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }
}

// Services contain business logic
@Injectable()
export class ProductService {
  async createProduct(dto: CreateProductDto) {
    // Implementation with proper error handling
    if (!dto.name) {
      throw new BadRequestException('Product name is required');
    }
    return product;
  }
}
```

### Message Patterns

**Always** use constants from `libs/constant/`. Never hardcode message patterns.

```typescript
// ✅ CORRECT - Use constants
import { PRODUCT_MESSAGE_PATTERNS } from 'libs/constant/message-pattern-product.constant';
this.client.send(PRODUCT_MESSAGE_PATTERNS.PRODUCT_CREATE, dto);

// ❌ WRONG - Don't hardcode strings
this.client.send('product.create', dto);
```

Message pattern files:
- `libs/constant/message-pattern-product.constant.ts`
- `libs/constant/message-pattern-auth.constant.ts`
- `libs/constant/message-pattern-inventory.constant.ts`
- `libs/constant/message-pattern.constant.ts` (orders, user, rewards, payments)

### DTOs and Validation

```typescript
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  description?: string;
}
```

### Response Format

Services should return data directly. Do NOT manually wrap responses in an `ApiResponse<T>` structure - NestJS handles response transformation.

```typescript
// ✅ CORRECT - Return data directly
async createProduct(dto: CreateProductDto) {
  const product = await this.productRepository.save(dto);
  return product;  // NestJS handles the response structure
}

// ❌ WRONG - Don't manually wrap responses
async createProduct(dto: CreateProductDto) {
  const product = await this.productRepository.save(dto);
  return {
    success: true,
    message: 'Product created successfully',
    data: product,
  };
}

### Error Handling

```typescript
// In services
if (!product) {
  throw new NotFoundException('Product not found');
}

// RPC exception filter handles microservice errors
catch (error) {
  throw new RpcException({
    statusCode: error.status || 500,
    message: error.message,
  });
}
```

## File Structure Guidelines

### Service Structure

```
apps/[service-name]/
├── src/
│   ├── [service-name].module.ts
│   ├── [service-name].controller.ts  # Only in gateway
│   ├── [service-name].service.ts
│   ├── dto/
│   │   ├── create-[entity].dto.ts
│   │   ├── update-[entity].dto.ts
│   │   └── query-[entity].dto.ts
│   ├── entities/
│   │   └── [entity].entity.ts
│   └── main.ts
├── test/
└── tsconfig.app.json
```

### Shared Libraries

- **`libs/common/`**: Shared utilities, decorators, guards, RMQ module, MySQL/Postgres helpers
  - Import via: `@app/common`
- **`libs/database/`**: Database configurations, base entities
  - Import via: `@app/database`
- **`libs/cached/`**: Redis cache implementations
  - Import via: `@app/cached`
- **`libs/constant/`**: Message patterns, TCP port configurations, CDN constants
  - Import directly: `libs/constant/message-pattern-*.constant.ts`

Path aliases are configured in `tsconfig.json` and `jest` config for the `@app/*` imports.

## Common Tasks

### Adding a New Endpoint

1. **Add/Update Message Pattern**: Add constant in `libs/constant/message-pattern-*.constant.ts`
   ```typescript
   export const PRODUCT_MESSAGE_PATTERNS = {
     PRODUCT_CREATE: 'product.create',
     // ...
   } as const;
   ```

2. **Add DTO**: Create DTO in the microservice's `dto/` folder with validation decorators
   ```typescript
   export class CreateProductDto {
     @IsString()
     @IsNotEmpty()
     name: string;
   }
   ```

3. **Microservice Controller**: Add `@MessagePattern` handler
   ```typescript
   @MessagePattern(PRODUCT_MESSAGE_PATTERNS.PRODUCT_CREATE)
   async createProduct(@Payload() dto: CreateProductDto) {
     return this.productService.createProduct(dto);
   }
   ```

4. **Microservice Service**: Implement business logic with proper error handling
   
5. **Gateway Controller**: Add REST endpoint that sends message to microservice
   ```typescript
   @Post()
   @ApiOperation({ summary: 'Create product' })
   async create(@Body() dto: CreateProductDto) {
     return this.client.send(PRODUCT_MESSAGE_PATTERNS.PRODUCT_CREATE, dto);
   }
   ```

6. **Gateway Service** (if needed): Handle aggregation or coordination logic

7. **Document**: Add Swagger decorators (`@ApiOperation`, `@ApiResponse`, etc.)

### Adding a New Service

1. Generate with: `nest g app [service-name]`
2. Configure message pattern in `libs/constant/`
3. Add port in `port-tcp.constant.ts`
4. Set up database module if needed
5. Configure in `docker-compose.yml`
6. Add health check script

### Database Migrations

- SQL files in `database/` folder
- Use TypeORM entities with decorators
- Follow naming: `[feature]_migration.sql`

### Infrastructure Setup

Before running services, start required infrastructure:
```bash
docker-compose up -d     # Starts MySQL, PostgreSQL, RabbitMQ, Redis, Adminer
docker-compose logs      # View container logs
docker-compose down      # Stop all containers
```

Services:
- MySQL: `localhost:3306` (Orders service)
- PostgreSQL: `localhost:5432` (Inventory service)
- RabbitMQ: `localhost:5672` (Management UI: `localhost:15672`)
- Redis: `localhost:6379` (Session/cache)
- Adminer: `localhost:8080` (Database UI)

## Environment Variables

Each service requires:

- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`
- `RABBITMQ_URL`
- `REDIS_HOST`, `REDIS_PORT`
- `JWT_SECRET` (auth service)
- Service-specific ports from `port-tcp.constant.ts`

## API Testing

The `rest/` directory contains `.http` files for testing endpoints with REST Client:
- `rest/auth.rest.http` - Authentication endpoints
- `rest/order.rest.http` - Order management
- `rest/product.rest.http` - Product catalog
- `rest/inventory.rest.http` - Inventory operations

Use the REST Client extension in VS Code to run these requests.

## Architecture Key Points

### Gateway vs Microservice Controllers

**CRITICAL**: There are TWO types of controllers in this architecture:

1. **Gateway Controllers** (`apps/gateway/src/**/`)
   - Handle HTTP REST requests
   - Use `@Controller()`, `@Get()`, `@Post()`, etc.
   - Send messages to microservices via `ClientProxy.send()`
   - Return results directly to HTTP clients
   - Include Swagger documentation

2. **Microservice Controllers** (`apps/{service}/src/`)
   - Handle message patterns from RabbitMQ/TCP
   - Use `@Controller()` with `@MessagePattern()` or `@EventPattern()`
   - Process messages and return data
   - NO HTTP decorators (`@Get`, `@Post`, etc.)
   - NO Swagger decorators

### Important Rules

- **Gateway** is the ONLY service that exposes REST endpoints
- **Microservices** ONLY communicate via TCP/RabbitMQ message patterns
- Always use **DTOs** with validation decorators (`class-validator`)
- Follow **repository pattern** for database access (inject repositories, not DataSource)
- Use **constants** from `libs/constant/` for message patterns and ports
- Implement **proper error handling**:
  - Microservices: throw standard NestJS exceptions (`NotFoundException`, `BadRequestException`)
  - Gateway: RPC exceptions are automatically transformed to HTTP responses
- Add **Swagger documentation** on gateway controllers only
- **Never expose internal service ports** (TCP ports in `PORT_TCP`) directly to clients
- **Never hardcode** message patterns, ports, or service names

### Database Patterns

- **Orders service**: Uses MySQL with TypeORM
- **Inventory service**: Uses PostgreSQL with TypeORM
- Use repository pattern:
  ```typescript
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}
  ```
- Entity files use TypeORM decorators (`@Entity`, `@Column`, `@PrimaryGeneratedColumn`, etc.)

## Code Review Checklist

- [ ] **DTOs** have validation decorators (`@IsString()`, `@IsNotEmpty()`, etc.)
- [ ] **Dependency injection** used correctly (constructor injection)
- [ ] **Message patterns** use constants from `libs/constant/`
- [ ] **Gateway controllers** use `ClientProxy.send()` with message patterns
- [ ] **Microservice controllers** use `@MessagePattern()` decorators
- [ ] **Services** return data directly (no manual response wrapping)
- [ ] **Errors** throw standard NestJS exceptions (not RpcException in microservices)
- [ ] **Swagger documentation** added (gateway controllers only)
- [ ] **No hardcoded values** (ports, patterns, service names)
- [ ] **TypeScript types** properly defined (avoid `any`)
- [ ] **No direct database access** in controllers (use services/repositories)
- [ ] **Repository pattern** used (inject `Repository<T>`, not raw DataSource)
- [ ] **Imports** use path aliases (`@app/common`, `@app/database`, `@app/cached`)

## Troubleshooting Common Issues

### ESLint/TypeScript Errors

The project uses strict TypeScript and ESLint rules. Note these intentional configurations:
- `@typescript-eslint/no-explicit-any: 'off'` - `any` is allowed when necessary
- `@typescript-eslint/no-floating-promises: 'warn'` - Warns on unhandled promises
- `noImplicitAny: false` - Implicit any is allowed

For RPC exception filters with complex error handling, type guards may be needed to satisfy strict type checking.

### Service Communication Issues

1. **Check RabbitMQ connection**: Ensure `docker-compose up -d` is running
2. **Verify message patterns**: Must match exactly between gateway and microservice
3. **Check service ports**: Defined in `libs/constant/port-tcp.constant.ts`
4. **Test individual service**: Run single service with `npm run start:[service-name]`

### Database Connection Issues

1. **Orders service (MySQL)**: Check `DATABASE_HOST`, `DATABASE_PORT=3306`
2. **Inventory service (PostgreSQL)**: Check `DATABASE_HOST`, `DATABASE_PORT=5432`
3. **Run migrations**: Execute SQL scripts in `database/` directory
4. **Check Adminer**: Visit `http://localhost:8080` to verify database state
