import { MicroserviceErrorSchema } from '@app/common/schemas';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/** Shape of the JSON body sent to the client */
interface ErrorResponseBody {
  statusCode: number;
  message: string;
  timestamp: string;
  error?: string;
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

    //1. Default values for unknown exceptions
    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    const message: string | string[] = 'Internal server error';
    const error: string = 'UnknownError';

    this.logger.error(
      `Raw exception caught: ${JSON.stringify(exception)}`,
      exception instanceof Error ? exception.stack : undefined,
      `${request.method} ${request.url}`,
    );

    // 2. Attempt to parse the exception using the MicroserviceErrorSchema Zod schema
    const parsed = MicroserviceErrorSchema.safeParse(exception);
    if (parsed.success) {
      response
        .status(
          Number(parsed.data.statusCode) || HttpStatus.INTERNAL_SERVER_ERROR,
        )
        .json({
          statusCode:
            Number(parsed.data.statusCode) || HttpStatus.INTERNAL_SERVER_ERROR,
          error: parsed.data.error || 'Internal Server Error',
          message: parsed.data.message,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
        });
      return;
    }

    // 3. If parsing fails, log the error and send a generic response
    if (Number(status) < 100 || Number(status) > 599) {
      this.logger.error(
        `Invalid status code detected: ${status}, using 500 instead`,
      );
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    // 4. handle defaulting to generic values for unknown exceptions
    const errorResponse: ErrorResponseBody = {
      statusCode: status,
      message: Array.isArray(message) ? message.join(', ') : message,
      timestamp: new Date().toISOString(),
      error,
      path: request.url,
      method: request.method,
    };

    try {
      response.status(status).json(errorResponse);
    } catch (err) {
      this.logger.error(
        `Failed to send error response: ${err instanceof Error ? err.stack : err}`,
        `${request.method} ${request.url}`,
      );
      response.status(500).json({
        statusCode: 500,
        message: 'Failed to process error response',
        timestamp: new Date().toISOString(),
        path: request.url,
        error,
        method: request.method,
      } satisfies ErrorResponseBody);
    }
  }
}
