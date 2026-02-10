# Plan: Fix TypeScript ESLint Errors in RPC Exception Filter

## Current Situation
The `rpc-exception.filter.ts` file has 60+ TypeScript ESLint errors related to unsafe `any` type usage. The errors fall into these categories:

1. **Unsafe member access** (`.message`, `.code`, `.constructor`, `.includes`)
2. **Unsafe assignments** of `any` values
3. **Unsafe returns** of `any` values
4. **Unsafe calls** of `any` typed values
5. **Template literal expression** issues with `rpcException.getError()`
6. **Enum comparison** issues in switch statements

## Analysis: Fix vs Disable

### Option 1: Disable Rules (Quick Fix)
**Pros:**
- Fast solution
- Minimal code changes
- Maintains current behavior

**Cons:**
- Loses type safety benefits
- Hides potential runtime errors
- Doesn't improve code quality
- May mask future issues

### Option 2: Fix the Code (Recommended)
**Pros:**
- Improves type safety
- Better code quality and maintainability
- Catches errors at compile time
- Follows TypeScript best practices

**Cons:**
- Requires more work
- Need to define proper types/interfaces
- May need to handle edge cases

## Recommended Approach: Fix the Code

### Step 1: Define Type Interfaces
Create proper types for exception handling:
- `DatabaseError` interface for database exceptions
- `ValidationError` interface for validation exceptions
- `ErrorResponse` interface for HTTP exception responses
- Union types for exception handling

### Step 2: Fix Type Annotations
- Replace `any` with proper types
- Use type guards for runtime checks
- Add proper type assertions where necessary

### Step 3: Fix Specific Issues
1. **Template literal expressions**: Convert `rpcException.getError()` to string properly
2. **Enum comparisons**: Ensure switch cases match enum types
3. **Member access**: Use type guards before accessing properties
4. **Unsafe calls**: Add proper type checking before method calls

### Step 4: Alternative: Selective Rule Disabling
If fixing is too complex, we can:
- Disable rules only for this specific file using ESLint comments
- Keep strict rules for the rest of the codebase
- Document why rules are disabled

## Implementation Plan

### Phase 1: Create Type Definitions
```typescript
interface DatabaseError {
  code?: string;
  message?: string;
  constructor?: { name?: string };
}

interface ValidationError {
  message?: string | string[];
  constructor?: { name?: string };
}

interface ErrorResponse {
  message?: string;
  error?: string;
}
```

### Phase 2: Add Type Guards
```typescript
private isDatabaseError(exception: unknown): exception is DatabaseError {
  // Type-safe checks
}

private isValidationError(exception: unknown): exception is ValidationError {
  // Type-safe checks
}
```

### Phase 3: Fix Method Signatures
- Change `catch(exception: any, ...)` to `catch(exception: unknown, ...)`
- Update all helper methods to use proper types
- Fix return types

### Phase 4: Fix Template Literals
- Convert `rpcException.getError()` to string safely
- Use `String()` or `JSON.stringify()` where appropriate

### Phase 5: Fix Switch Statement
- Ensure HttpStatus enum is used correctly
- Add type assertions if needed

## Files to Update
1. `apps/user/src/filters/rpc-exception.filter.ts` (primary)
2. `apps/rewards/src/filters/rpc-exception.filter.ts` (similar issues)
3. Potentially other filter files in other services

## Decision Point
**Recommendation**: Fix the code properly for better type safety and maintainability.

**Alternative**: If time-constrained, disable rules for exception filter files only, with clear documentation.

## Next Steps
1. Review this plan
2. Decide: Fix code or disable rules
3. Implement chosen approach
4. Test exception handling still works correctly
5. Apply same fix to similar files
