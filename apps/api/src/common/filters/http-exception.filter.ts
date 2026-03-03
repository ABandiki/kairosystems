import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

/**
 * Global exception filter that:
 * - Returns standardized error responses
 * - Obfuscates internal errors in production (never leaks stack traces)
 * - Logs actual error details server-side only
 * - Handles Prisma-specific database errors
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');
  private readonly isProduction = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else {
        const resp = exceptionResponse as Record<string, any>;
        message = resp.message || exception.message;
        error = resp.error || exception.name;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const result = this.handlePrismaError(exception);
      status = result.status;
      message = result.message;
      error = 'DatabaseError';
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data provided';
      error = 'ValidationError';
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = this.isProduction
        ? 'Internal server error'
        : (exception as Error)?.message || 'Unknown error';
      error = 'InternalServerError';
    }

    // Log the actual error internally — sanitized (no PII)
    this.logError(request, status, exception);

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? message : message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
    status: number;
    message: string;
  } {
    switch (error.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          message: 'A record with this value already exists',
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Record not found',
        };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Referenced record does not exist',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: this.isProduction
            ? 'Internal server error'
            : `Database error: ${error.code}`,
        };
    }
  }

  private logError(
    request: Request,
    status: number,
    exception: unknown,
  ): void {
    const logData = {
      method: request.method,
      path: request.url,
      status,
      userId: (request as any).user?.sub || 'anonymous',
    };

    if (status >= 500) {
      this.logger.error(
        `${logData.method} ${logData.path} ${status} [user:${logData.userId}]`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else if (status >= 400) {
      this.logger.warn(
        `${logData.method} ${logData.path} ${status} [user:${logData.userId}]`,
      );
    }
  }
}
