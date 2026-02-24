import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RpcErrorBody } from '../microservice-error.handler';

/** Shape of the object NestJS puts inside HttpException.getResponse() */
interface HttpExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

/** Shape of the JSON body sent to the client */
interface ErrorResponseBody {
  statusCode: number;
  status: 'error';
  error: string;
  message: string;
  data: null;
  timestamp: string;
  path: string;
  method: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error: string = 'UnknownError';

    this.logger.error(
      `Raw exception caught: ${JSON.stringify(exception)}`,
      exception instanceof Error ? exception.stack : undefined,
      `${request.method} ${request.url}`,
    );

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.constructor.name;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resp = exceptionResponse as HttpExceptionResponse;
        message = resp.message ?? exception.message;
        error = resp.error ?? exception.constructor.name;
      } else {
        message = exception.message;
        error = exception.constructor.name;
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message || 'Internal server error';
      error = exception.constructor.name;
    } else if (typeof exception === 'object' && exception !== null) {
      const errorObj = exception as RpcErrorBody;

      if (errorObj.statusCode !== undefined) {
        status = errorObj.statusCode;
      } else if (errorObj.status !== undefined) {
        status = errorObj.status;
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
      }

      const rawMessage =
        errorObj.message ?? errorObj.error ?? 'Internal server error';
      message = rawMessage;
      error = errorObj.error ?? 'MicroserviceError';

      this.logger.error(
        `Microservice error: Status=${status}, Message=${Array.isArray(message) ? message.join(', ') : message}`,
        undefined,
        `${request.method} ${request.url}`,
      );
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'UnknownError';
    }

    if (Number(status) < 100 || Number(status) > 599) {
      this.logger.error(
        `Invalid status code detected: ${status}, using 500 instead`,
      );
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    const errorResponse: ErrorResponseBody = {
      statusCode: status,
      status: 'error',
      error,
      message: Array.isArray(message) ? message.join(', ') : message,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    if (Number(status) >= 500) {
      this.logger.error(
        `HTTP ${status} Error Response: ${JSON.stringify(errorResponse)}`,
        undefined,
        `${request.method} ${request.url}`,
      );
    } else {
      this.logger.warn(
        `HTTP ${status} Error Response: ${JSON.stringify(errorResponse)}`,
        `${request.method} ${request.url}`,
      );
    }

    try {
      response.status(status).json(errorResponse);
    } catch (responseError) {
      const msg =
        responseError instanceof Error
          ? responseError.message
          : String(responseError);
      this.logger.error(
        `Failed to send error response: ${msg}`,
        undefined,
        `${request.method} ${request.url}`,
      );
      response.status(500).json({
        statusCode: 500,
        status: 'error',
        error: 'ResponseError',
        message: 'Failed to process error response',
        data: null,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      } satisfies ErrorResponseBody);
    }
  }
}
