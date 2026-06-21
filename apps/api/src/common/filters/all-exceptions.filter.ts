import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import type { ApiErrorResponse } from '@trakr/schemas';
import type { Response } from 'express';

type HttpExceptionResponse = {
  message?: string | string[];
  details?: unknown;
  statusCode?: number;
  error?: string;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { statusCode, message, details } = this.normalizeException(exception);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        exception instanceof Error ? exception.message : 'Unknown error',
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const body: ApiErrorResponse = {
      success: false,
      error: {
        statusCode,
        message,
        ...(details !== undefined ? { details } : {}),
      },
    };

    response.status(statusCode).json(body);
  }

  private normalizeException(exception: unknown): {
    statusCode: number;
    message: string;
    details?: unknown;
  } {
    if (exception instanceof ThrottlerException) {
      return {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests',
      };
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        return { statusCode, message: exceptionResponse };
      }

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const response = exceptionResponse as HttpExceptionResponse;

        if (
          typeof response.message === 'string' &&
          response.details !== undefined
        ) {
          return {
            statusCode,
            message: response.message,
            details: response.details,
          };
        }

        if (typeof response.message === 'string') {
          return { statusCode, message: response.message };
        }

        if (Array.isArray(response.message)) {
          return {
            statusCode,
            message: response.message.join(', '),
          };
        }

        if (
          typeof response.message === 'object' &&
          response.message !== null &&
          'formErrors' in response.message
        ) {
          return {
            statusCode,
            message: 'Validation failed',
            details: response.message,
          };
        }

        if (response.error && typeof response.error === 'string') {
          return { statusCode, message: response.error };
        }
      }

      return {
        statusCode,
        message: exception.message || 'Request failed',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }
}
