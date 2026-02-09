# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pre-Loved API is a NestJS microservices e-commerce platform for second-hand products. It uses a monorepo structure managed by `nest-cli.json`.

## Commands

```bash
# Start all services (two terminal windows)
npm run start:nodeA   # Gateway, Orders, User, Product, Auth
npm run start:nodeB   # Inventory, Payments, Rewards

# Start individual service in watch mode
npm run start:gateway
npm run start:product
npm run start:auth
# etc.

# Build, lint, format
npm run build
npm run lint          # ESLint with auto-fix
npm run format        # Prettier

# Tests
npm run test                          # All unit tests
npm run test -- path/to/file.spec.ts  # Single test file
npm run test -- apps/product          # Tests for a service
npm run test:e2e
npm run test:cov

# Infrastructure (must be running before services)
docker-compose up -d   # MySQL, RabbitMQ, Elasticsearch, Kibana, Logstash
```

## Architecture

### Gateway + Microservices Pattern

The **gateway** (`apps/gateway/`) is the only service exposing HTTP REST endpoints (port 3000). All other services are internal microservices that communicate via **TCP** or **RabbitMQ**.

**Request flow:** Client HTTP request → Gateway Controller → `ClientProxy.send(MESSAGE_PATTERN, dto)` → Microservice Controller (`@MessagePattern`) → Service → Repository

### Services and Their Transports

| Service | Transport | Port/Queue | Database |
|---------|-----------|------------|----------|
| Gateway | HTTP | 3000 | - |
| Product | TCP | 3006 | MySQL |
| Auth | TCP | 3007 | MySQL |
| User | TCP | 3003 | MySQL |
| Orders | TCP | 3001 | MySQL |
| Inventory | TCP + RabbitMQ | 3002 + queues | PostgreSQL |
| Payments | RabbitMQ only | queues | - |
| Rewards | RabbitMQ only | queues | - |

MySQL runs on port **3309** (mapped from 3306 in Docker). Inventory uses PostgreSQL on **5432**.

### Event-Driven Communication

Order creation broadcasts via RabbitMQ **fanout exchange** (`order.fanout`) to Inventory, Payments, and Rewards services using `@EventPattern`.

### Shared Libraries

- **`@app/common`** (`libs/common/`) - RMQ service, MySQL/Postgres modules, shared DTOs, interfaces, constants (queue names, event names, exchange names)
- **`@app/database`** (`libs/database/`) - Database modules, health checks
- **`@app/cached`** (`libs/cached/`) - Redis cache operations (strings, hashes, lists, sets, sorted sets)
- **`libs/constant/`** (imported by path, no alias) - Message pattern constants, TCP port constants, CDN constants

### Message Pattern Constants

All message patterns live in `libs/constant/message-pattern-*.constant.ts`. **Never hardcode pattern strings** - always import from these files:
- `message-pattern-product.constant.ts` - Product, Brand, Category patterns
- `message-pattern-auth.constant.ts` - Auth token patterns
- `message-pattern-inventory.constant.ts` - Inventory/stock patterns
- `message-pattern.constant.ts` - User, Order, Rewards, Payments patterns

TCP ports are defined in `libs/constant/port-tcp.constant.ts`.

### Auth/JWT

Auth service issues HS256 JWT tokens. Access tokens expire in 15 minutes, refresh tokens in 7 days. Payload: `{ tid: userId, sub: username, iat }`. JWT_SECRET configured via environment.

## Key Conventions

- **Gateway controllers** use HTTP decorators (`@Get`, `@Post`) + Swagger decorators and delegate via `ClientProxy.send()`
- **Microservice controllers** use `@MessagePattern()` / `@EventPattern()` - no HTTP or Swagger decorators
- **Services return data directly** - do not manually wrap in `{ success, message, data }` format
- **DTOs** use `class-validator` decorators (`@IsString()`, `@IsNotEmpty()`, etc.)
- **Database access** uses TypeORM repository pattern (`@InjectRepository`)
- **Error handling**: Microservices throw standard NestJS exceptions (`NotFoundException`, `BadRequestException`); `AllRpcExceptionFilter` converts them for transport
- **Path aliases**: `@app/common`, `@app/database`, `@app/cached` (configured in tsconfig.json)

## Code Style

- Prettier: single quotes, no parens on single arrow params, trailing commas
- ESLint: `no-explicit-any` is off, `noImplicitAny` is false, floating promises warn
- SWC compiler used for builds (configured in nest-cli.json via webpack)

## Environment

Env files are split by node group:
- `local/nodeA/.env` - RabbitMQ, MySQL, JWT_SECRET, Gateway port, CDN URL
- `local/nodeB/.env` - RabbitMQ, PostgreSQL
- Root `.env` - MySQL connection defaults

RabbitMQ vhost: `/rabbit-pre-loved`, credentials: admin/admin.

## Adding a New Endpoint

1. Add message pattern constant in `libs/constant/message-pattern-*.constant.ts`
2. Create DTO with validation decorators in the microservice's `dto/` folder
3. Add `@MessagePattern` handler in the microservice controller
4. Implement business logic in the service
5. Add gateway controller endpoint with `ClientProxy.send()` and Swagger decorators
