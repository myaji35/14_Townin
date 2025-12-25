import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as Sentry from '@sentry/node';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private readonly slowRequestThreshold = 1000; // 1 second
  private readonly verySlowRequestThreshold = 3000; // 3 seconds

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const userId = request.user?.id || 'anonymous';

    const startTime = Date.now();

    // Start Sentry transaction (if enabled)
    const transaction = Sentry.startTransaction({
      op: 'http.server',
      name: `${method} ${url}`,
      data: {
        method,
        url,
        userId,
      },
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const duration = Date.now() - startTime;

          // Log request
          this.logRequest(method, url, statusCode, duration, userId, ip, userAgent);

          // Finish Sentry transaction
          transaction.setHttpStatus(statusCode);
          transaction.finish();
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          // Log error request
          this.logger.error(
            `${method} ${url} ${statusCode} ${duration}ms - ${error.message}`,
            error.stack,
          );

          // Capture in Sentry
          Sentry.captureException(error, {
            contexts: {
              http: {
                method,
                url,
                status_code: statusCode,
                user_id: userId,
              },
            },
          });

          // Finish Sentry transaction
          transaction.setHttpStatus(statusCode);
          transaction.finish();
        },
      }),
    );
  }

  private logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    userId: string,
    ip: string,
    userAgent: string,
  ) {
    const logData = {
      method,
      url,
      statusCode,
      duration,
      userId,
      ip,
      userAgent: userAgent.substring(0, 100), // Truncate
    };

    // Log level based on status code and duration
    if (statusCode >= 500) {
      this.logger.error(`${method} ${url} ${statusCode} ${duration}ms`, JSON.stringify(logData));
    } else if (statusCode >= 400) {
      this.logger.warn(`${method} ${url} ${statusCode} ${duration}ms`, JSON.stringify(logData));
    } else if (duration > this.verySlowRequestThreshold) {
      this.logger.warn(
        `VERY SLOW REQUEST: ${method} ${url} ${statusCode} ${duration}ms`,
        JSON.stringify(logData),
      );
    } else if (duration > this.slowRequestThreshold) {
      this.logger.warn(
        `Slow request: ${method} ${url} ${statusCode} ${duration}ms`,
        JSON.stringify(logData),
      );
    } else {
      this.logger.log(`${method} ${url} ${statusCode} ${duration}ms`);
    }
  }
}
