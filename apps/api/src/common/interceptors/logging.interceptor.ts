import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

/**
 * Audit logging interceptor that logs every request with:
 * - Method, path, userId, status code, response time
 * - Strips PII (no email, phone, IP in logs)
 * - Logs only IDs and status messages
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const path = request.url;
    const userId = (request as any).user?.sub || 'anon';
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const duration = Date.now() - start;
          this.logger.log(
            `${method} ${path} ${response.statusCode} ${duration}ms [user:${userId}]`,
          );
        },
        error: () => {
          // Error logging handled by GlobalExceptionFilter
          // Only log timing here
          const duration = Date.now() - start;
          this.logger.log(
            `${method} ${path} ERR ${duration}ms [user:${userId}]`,
          );
        },
      }),
    );
  }
}
