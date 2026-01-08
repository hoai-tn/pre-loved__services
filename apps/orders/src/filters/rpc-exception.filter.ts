import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';

/**
 * Interface for database-related errors
 */
interface DatabaseError {
  code?: string;
  message?: string;
  constructor?: { name?: string };
}

/**
 * Interface for validation errors
 */
interface ValidationError {
  message?: string | string[];
  constructor?: { name?: string };
}

/**
 * Interface for HTTP exception response
 */
interface ErrorResponse {
  message?: string;
  error?: string;
}

/**
 * Global RPC Exception Filter for Orders Service
 * Converts HttpException to RpcException for proper microservice communication
 */
@Catch()
export class AllRpcExceptionFilter extends BaseRpcExceptionFilter {
  private readonly logger = new Logger(AllRpcExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const exceptionName =
      exception && typeof exception === 'object' && 'constructor' in exception
        ? (exception.constructor as { name?: string })?.name
        : 'Unknown';
    const exceptionMessage =
      exception && typeof exception === 'object' && 'message' in exception
        ? String((exception as { message?: unknown }).message)
        : undefined;

    this.logger.debug(`Handling exception: ${exceptionName}`, exceptionMessage);

    // If it's already an RpcException, pass it through
    if (exception instanceof RpcException) {
      this.logger.debug('Already RpcException, passing through');
      return super.catch(exception, host);
    }

    // Convert HttpException to RpcException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      let message: string;
      if (typeof response === 'string') {
        message = response;
      } else if (
        response &&
        typeof response === 'object' &&
        'message' in response
      ) {
        const errorResponse = response as ErrorResponse;
        message = errorResponse.message || exception.message;
      } else {
        message = exception.message;
      }

      const rpcException = new RpcException({
        statusCode: status,
        message,
        error: this.getErrorName(status),
        timestamp: new Date().toISOString(),
      });

      this.logger.debug(
        `Converted HttpException to RpcException: ${status} - ${exception.message}`,
      );
      return super.catch(rpcException, host);
    }

    // Handle TypeORM/Database errors
    if (this.isDatabaseError(exception)) {
      const rpcException = this.handleDatabaseError(exception);
      const errorValue = rpcException.getError();
      const errorString =
        typeof errorValue === 'string'
          ? errorValue
          : JSON.stringify(errorValue);
      this.logger.debug(
        `Converted Database error to RpcException: ${errorString}`,
      );
      return super.catch(rpcException, host);
    }

    // Handle validation errors
    if (this.isValidationError(exception)) {
      const rpcException = this.handleValidationError(exception);
      const errorValue = rpcException.getError();
      const errorString =
        typeof errorValue === 'string'
          ? errorValue
          : JSON.stringify(errorValue);
      this.logger.debug(
        `Converted Validation error to RpcException: ${errorString}`,
      );
      return super.catch(rpcException, host);
    }

    // Default: convert to RpcException with 500 status
    const defaultMessage =
      exception &&
      typeof exception === 'object' &&
      'message' in exception &&
      typeof (exception as { message?: unknown }).message === 'string'
        ? (exception as { message: string }).message
        : 'Internal server error';

    const rpcException = new RpcException({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: defaultMessage,
      error: 'Internal Server Error',
      timestamp: new Date().toISOString(),
    });

    this.logger.error(
      `Unhandled exception converted to RpcException:`,
      exception,
    );
    return super.catch(rpcException, host);
  }

  private isDatabaseError(exception: unknown): exception is DatabaseError {
    if (!exception || typeof exception !== 'object') {
      return false;
    }

    const dbError = exception as DatabaseError;
    const constructorName =
      dbError.constructor && typeof dbError.constructor === 'object'
        ? dbError.constructor.name
        : undefined;
    const message = typeof dbError.message === 'string' ? dbError.message : '';
    const code = typeof dbError.code === 'string' ? dbError.code : undefined;

    return (
      constructorName === 'QueryFailedError' ||
      code === '23505' ||
      code === '23502' ||
      code === '23503' ||
      message.includes('duplicate key value violates') ||
      message.includes('unique constraint') ||
      message.includes('foreign key constraint')
    );
  }

  private isValidationError(exception: unknown): exception is ValidationError {
    if (!exception || typeof exception !== 'object') {
      return false;
    }

    const validationError = exception as ValidationError;
    const constructorName =
      validationError.constructor &&
      typeof validationError.constructor === 'object'
        ? validationError.constructor.name
        : undefined;
    const message = validationError.message;
    const messageString =
      typeof message === 'string'
        ? message
        : Array.isArray(message)
          ? message.join(' ')
          : '';

    return (
      constructorName === 'ValidationError' ||
      Array.isArray(message) ||
      messageString.includes('should not be empty') ||
      messageString.includes('must be') ||
      messageString.includes('is not valid')
    );
  }

  private handleDatabaseError(exception: DatabaseError): RpcException {
    const message =
      typeof exception.message === 'string' ? exception.message : '';
    const code =
      typeof exception.code === 'string' ? exception.code : undefined;

    if (message.includes('duplicate key value violates') || code === '23505') {
      let userMessage = 'Duplicate entry found';

      if (message.includes('order_number')) {
        userMessage = 'Order with this number already exists';
      } else if (message.includes('user_id')) {
        userMessage = 'Order for this user already exists';
      }

      return new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message: userMessage,
        error: 'Conflict',
        timestamp: new Date().toISOString(),
      });
    }

    if (message.includes('null value in column') || code === '23502') {
      return new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Required field is missing',
        error: 'Bad Request',
        timestamp: new Date().toISOString(),
      });
    }

    if (message.includes('foreign key constraint') || code === '23503') {
      return new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Referenced record does not exist',
        error: 'Bad Request',
        timestamp: new Date().toISOString(),
      });
    }

    return new RpcException({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Database operation failed',
      error: 'Internal Server Error',
      timestamp: new Date().toISOString(),
    });
  }

  private handleValidationError(exception: ValidationError): RpcException {
    let message = 'Validation failed';

    if (Array.isArray(exception.message)) {
      message = exception.message.join(', ');
    } else if (typeof exception.message === 'string') {
      message = exception.message;
    }

    return new RpcException({
      statusCode: HttpStatus.BAD_REQUEST,
      message: message,
      error: 'Bad Request',
      timestamp: new Date().toISOString(),
    });
  }

  private getErrorName(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Unprocessable Entity';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal Server Error';
      default:
        return 'Error';
    }
  }
}
