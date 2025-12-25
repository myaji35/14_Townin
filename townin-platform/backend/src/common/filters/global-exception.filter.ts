import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import { SlackService } from '../services/slack.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly slackService?: SlackService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    // Log error
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} ${status} - ${message}`,
        exception instanceof Error ? exception.stack : '',
      );

      // Capture in Sentry (5xx errors only)
      Sentry.captureException(exception, {
        contexts: {
          http: {
            method: request.method,
            url: request.url,
            status_code: status,
            user_agent: request.headers['user-agent'],
            ip: request.ip,
          },
        },
        user: {
          id: (request as any).user?.id,
          email: (request as any).user?.email,
        },
      });

      // Send Slack alert for critical errors
      if (this.slackService && process.env.NODE_ENV === 'production') {
        this.slackService.sendErrorAlert(
          exception instanceof Error ? exception : new Error(String(exception)),
          {
            method: request.method,
            url: request.url,
            statusCode: status,
            userId: (request as any).user?.id,
          },
        ).catch((err) => {
          this.logger.error(`Failed to send Slack alert: ${err.message}`);
        });
      }
    } else {
      this.logger.warn(`${request.method} ${request.url} ${status} - ${message}`);
    }

    response.status(status).json(errorResponse);
  }
}
