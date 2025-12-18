# Pre-Loved API

A microservices-based e-commerce API platform built with NestJS for managing pre-loved/second-hand products, orders, inventory, payments, and user management.

## 🏗️ Architecture

This project follows a microservices architecture pattern with the following services:

- **Gateway** - API Gateway that routes requests to appropriate microservices
- **Auth** - Authentication and authorization service
- **User** - User management service
- **Product** - Product catalog management
- **Orders** - Order processing service
- **Inventory** - Inventory and stock management
- **Payments** - Payment processing service
- **Rewards** - Rewards and loyalty program service

### Technology Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Message Queue**: RabbitMQ
- **Databases**: 
  - MySQL (Orders)
  - PostgreSQL (Inventory)
- **Caching**: Redis
- **ORM**: TypeORM
- **API Documentation**: Swagger/OpenAPI

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose
- MySQL 8.0
- PostgreSQL 15
- RabbitMQ

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Infrastructure Services

Start the required infrastructure services (MySQL, PostgreSQL, RabbitMQ, Redis) using Docker Compose:

```bash
docker-compose up -d
```

This will start:
- MySQL on port `3306`
- PostgreSQL on port `5432`
- RabbitMQ on port `5672` (Management UI on `15672`)
- Adminer (Database management UI) on port `8080`

### 4. Run Database Migrations

Execute the SQL scripts in the `database/` directory to set up the database schemas.

### 5. Start the Services

#### Development Mode

Start all services in development mode:

**Node A** (Gateway, Orders, User, Product, Auth):
```bash
npm run start:nodeA
```

**Node B** (Inventory, Payments, Rewards):
```bash
npm run start:nodeB
```

Or start individual services:

```bash
npm run start:gateway
npm run start:orders
npm run start:user
npm run start:product
npm run start:auth
npm run start:inventory
npm run start:payments
npm run start:rewards
```

#### Production Mode

Build the project:
```bash
npm run build
```

Start production services using the scripts in the `scripts/` directory.

## 📁 Project Structure

```
api/
├── apps/                    # Microservices applications
│   ├── auth/               # Authentication service
│   ├── gateway/            # API Gateway
│   ├── inventory/          # Inventory service
│   ├── orders/             # Orders service
│   ├── payments/           # Payments service
│   ├── product/            # Product service
│   ├── rewards/            # Rewards service
│   └── user/               # User service
├── libs/                   # Shared libraries
│   ├── cached/             # Caching utilities
│   ├── common/             # Common utilities
│   └── database/           # Database configuration
├── database/               # Database migration scripts
├── rest/                   # REST API test files (.http)
├── scripts/                # Deployment and utility scripts
└── local/                  # Local development configurations
```

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

## 📡 API Testing

The project includes REST client files in the `rest/` directory for testing API endpoints:

- `auth.rest.http` - Authentication endpoints
- `order.rest.http` - Order endpoints
- `product.rest.http` - Product endpoints
- `inventory.rest.http` - Inventory endpoints

Use these files with REST Client extensions in your IDE (e.g., REST Client for VS Code).

## 🔧 Available Scripts

- `npm run build` - Build the project
- `npm run start:dev` - Start in development mode
- `npm run start:prod` - Start in production mode
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run start:nodeA` - Start Node A services (Gateway, Orders, User, Product, Auth)
- `npm run start:nodeB` - Start Node B services (Inventory, Payments, Rewards)

## 🔐 Environment Variables

Create `.env` files for each service as needed. Common environment variables include:

- Database connection strings
- RabbitMQ connection settings
- Redis connection settings
- JWT secrets
- Service ports

## 📚 API Documentation

API documentation is available via Swagger when the services are running. Access the Swagger UI at:

- Gateway: `http://localhost:3000/api/docs` (adjust port as needed)

## 🐳 Docker

The project includes Docker Compose configuration for local development. Services can be managed using:

```bash
docker-compose up -d    # Start services
docker-compose down     # Stop services
docker-compose logs     # View logs
```

## 📝 License

UNLICENSED

## 👥 Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

---

For more detailed documentation, please refer to the `docs/` directory.

