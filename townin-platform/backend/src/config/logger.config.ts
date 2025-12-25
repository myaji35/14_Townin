/**
 * Logger Configuration
 *
 * This configuration can be enhanced with winston when the package is installed.
 * For now, we use NestJS built-in Logger.
 */

export interface LoggerConfig {
  level: string;
  timestamp: boolean;
}

export const loggerConfig: LoggerConfig = {
  level: process.env.LOG_LEVEL || 'debug',
  timestamp: true,
};

/**
 * Winston Configuration (for future use)
 *
 * Uncomment when winston and nest-winston are installed:
 *
 * import { WinstonModule } from 'nest-winston';
 * import * as winston from 'winston';
 *
 * export const winstonConfig = WinstonModule.createLogger({
 *   level: process.env.LOG_LEVEL || 'info',
 *   format: winston.format.combine(
 *     winston.format.timestamp(),
 *     winston.format.errors({ stack: true }),
 *     winston.format.json(),
 *   ),
 *   transports: [
 *     new winston.transports.Console({
 *       format: winston.format.combine(
 *         winston.format.colorize(),
 *         winston.format.simple(),
 *       ),
 *     }),
 *     new winston.transports.File({
 *       filename: 'logs/error.log',
 *       level: 'error',
 *       maxsize: 5242880, // 5MB
 *       maxFiles: 5,
 *     }),
 *     new winston.transports.File({
 *       filename: 'logs/combined.log',
 *       maxsize: 5242880,
 *       maxFiles: 5,
 *     }),
 *   ],
 * });
 */
