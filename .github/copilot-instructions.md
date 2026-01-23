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

## Coding Standards

### NestJS Best Practices

```typescript
// Use dependency injection
constructor(
  private readonly serviceClient: ClientProxy,
  @Inject('REDIS') private readonly redis: Redis,
) {}

// Controllers should delegate to services
@Controller('products')
export class ProductController {
  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }
}

// Services contain business logic
@Injectable()
export class ProductService {
  async create(dto: CreateProductDto): Promise<ApiResponse<Product>> {
    // Implementation
  }
}
```

### Message Patterns

Use constants from `libs/constant/`:

```typescript
// Good
this.client.send(MESSAGE_PATTERN_PRODUCT.CREATE, dto);

// Bad - avoid hardcoding
this.client.send('product.create', dto);
```

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

Always wrap responses in `ApiResponse<T>`:

```typescript
return {
  success: true,
  message: 'Product created successfully',
  data: product,
};
```

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

- `libs/common/`: Shared utilities, decorators, guards
- `libs/database/`: Database configurations, base entities
- `libs/cached/`: Redis cache implementations
- `libs/constant/`: Message patterns, ports, constants

## Common Tasks

### Adding a New Endpoint

1. Add DTO in service's `dto/` folder
2. Add method to service with business logic
3. Add controller method in **gateway** (not in service)
4. Add message pattern constant
5. Document with Swagger decorators

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

### Running Services

```bash
# Development
npm run start:[service-name]        # Single service
npm run start:nodeA                  # Gateway, Orders, User, Product, Auth
npm run start:nodeB                  # Inventory, Payments, Rewards

# Production
./scripts/start-nodeA-prod.sh
./scripts/start-nodeB-prod.sh
```

## Environment Variables

Each service requires:

- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`
- `RABBITMQ_URL`
- `REDIS_HOST`, `REDIS_PORT`
- `JWT_SECRET` (auth service)
- Service-specific ports from `port-tcp.constant.ts`

## Testing

```bash
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Coverage
```

## Important Notes

- **Gateway** is the only service with REST controllers
- **Microservices** use TCP/RabbitMQ message patterns
- Always use **DTOs** for request/response validation
- Follow **repository pattern** for database access
- Use **constants** for message patterns and ports
- Implement **proper error handling** with RPC exceptions
- Add **Swagger documentation** for all endpoints
- **Never expose internal service ports** directly

## Code Review Checklist

- [ ] DTOs have proper validation decorators
- [ ] Services use dependency injection
- [ ] Message patterns use constants
- [ ] Responses wrapped in ApiResponse<T>
- [ ] Errors properly handled with RPC exceptions
- [ ] Swagger documentation added
- [ ] No hardcoded values
- [ ] TypeScript types properly defined
- [ ] No direct database access in controllers
