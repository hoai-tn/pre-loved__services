# GitHub Copilot Chat Commands

## Quick Reference Commands

### 🏗️ Architecture & Design

**@workspace Explain the microservices architecture**

- Shows how services communicate
- Explains message patterns and RabbitMQ setup
- Details database configurations per service

**@workspace Show me how [service] communicates with other services**

- Analyzes inter-service communication
- Shows message pattern usage

**@workspace What's the flow for creating an order?**

- Explains order processing workflow
- Shows service interactions

### 🔨 Code Generation

**Generate a new DTO for [entity] with validation**

```
Example: Generate a CreateOrderDto with userId, productId, quantity, and price fields with proper validation
```

**Create a new endpoint in gateway for [feature]**

```
Example: Create a new endpoint to get user order history with pagination
```

**Add a new message pattern for [service].[action]**

```
Example: Add message pattern for product.updateStock
```

**Generate TypeORM entity for [table]**

```
Example: Generate entity for reviews table with fields: id, userId, productId, rating, comment
```

### 🐛 Debugging & Fixes

**@workspace Why is [service] not connecting to RabbitMQ?**

- Checks configuration
- Verifies message patterns

**Fix the RPC exception handling in [file]**

- Applies proper exception filters
- Adds error response wrapping

**@workspace Show me all TODO and FIXME comments**

- Lists pending work items

### 📚 Documentation

**Document this API endpoint with Swagger decorators**

- Adds @ApiOperation, @ApiResponse
- Includes DTO schemas

**Generate JSDoc comments for this service**

- Adds comprehensive documentation

### 🧪 Testing

**Generate unit tests for [service/method]**

```
Example: Generate unit tests for ProductService.create method
```

**Create e2e test for [endpoint]**

```
Example: Create e2e test for POST /api/products
```

**Generate mock data for testing [entity]**

- Creates realistic test fixtures

### 🔄 Refactoring

**Refactor this code to follow NestJS best practices**

- Improves dependency injection
- Applies proper patterns

**Extract this logic into a separate service**

- Creates new service file
- Updates imports

**Convert this to use async/await**

- Modernizes promise handling

### 📊 Database

**Generate migration script for [change]**

```
Example: Generate migration to add `status` column to orders table
```

**Create repository methods for [entity]**

- Implements common CRUD operations

**Optimize this database query**

- Adds proper indexing hints
- Improves query performance

### 🔐 Security

**Add authentication guard to this endpoint**

- Implements JWT guard
- Adds proper decorators

**Validate and sanitize this input DTO**

- Adds class-validator decorators

### 🚀 DevOps

**Generate docker-compose service for [new-service]**

- Creates service configuration
- Sets up environment variables

**Create health check endpoint for [service]**

- Implements /health endpoint
- Adds dependency checks

## Slash Commands

### `/explain`

Select code and use `/explain` to understand:

- Complex business logic
- Message pattern flows
- Database queries

### `/fix`

Select problematic code and use `/fix` to:

- Fix TypeScript errors
- Resolve import issues
- Correct syntax mistakes

### `/tests`

Generate tests for selected code:

- Unit tests with Jest
- Mocks for dependencies
- Test edge cases

### `/doc`

Generate documentation:

- JSDoc comments
- Swagger decorators
- README sections

## Context-Specific Prompts

### Working in Gateway Service

```
"Create a controller method that calls the [service] via RabbitMQ and returns the response"
"Add error handling for when [service] is unavailable"
"Transform this HTTP request to a microservice message"
```

### Working in Microservices

```
"Implement message handler for [pattern]"
"Add validation for incoming RPC messages"
"Handle database transaction with rollback"
```

### Working with DTOs

```
"Add pagination to this query DTO"
"Create update DTO that extends create DTO with PartialType"
"Add transform decorators to sanitize input"
```

### Working with Entities

```
"Add soft delete to this entity"
"Create relationship with [other-entity]"
"Add indexes for commonly queried fields"
```

## Advanced Patterns

### Chain Multiple Services

```
@workspace Generate an endpoint that:
1. Validates user authentication
2. Checks inventory availability
3. Creates an order
4. Processes payment
5. Updates inventory
6. Sends confirmation
```

### Implement Feature Across Services

```
@workspace Implement product review feature:
- Add review entity in product service
- Create DTOs for create/update/query
- Add gateway endpoints
- Implement business logic
- Add tests
```

### Debugging Complex Issues

```
@workspace I'm getting RPC timeout errors when:
- Creating orders during high traffic
- Show me the message queue configuration
- Check for connection pooling issues
- Suggest optimization strategies
```

## Tips for Better Results

1. **Be Specific**: Include entity names, field types, and requirements
2. **Provide Context**: Mention which service you're working in
3. **Use @workspace**: For project-wide understanding
4. **Reference Files**: Use file paths when asking about specific code
5. **Iterate**: Ask follow-up questions to refine the solution
6. **Use Examples**: Show existing code you want to follow

## Common Workflows

### Adding New Feature

1. "Explain where this feature should be implemented"
2. "Generate the DTO with validation"
3. "Create the service method with business logic"
4. "Add gateway controller endpoint"
5. "Generate unit tests"
6. "Add Swagger documentation"

### Fixing Bugs

1. "Explain what this code does"
2. "Find potential issues in this logic"
3. "Fix the error handling"
4. "Add proper logging"
5. "Generate test cases to prevent regression"

### Code Review

1. "Review this PR for best practices"
2. "Check for security vulnerabilities"
3. "Suggest performance improvements"
4. "Verify error handling coverage"
