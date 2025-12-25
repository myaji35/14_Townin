import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

// Sanitize sensitive data from logs
const sanitizeFormat = winston.format((info) => {
  const sensitiveKeys = ['password', 'token', 'authorization', 'secret', 'apiKey'];

  const sanitize = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof value === 'object') {
        sanitized[key] = sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  return sanitize(info);
});

export const loggerConfig: WinstonModuleOptions = {
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    sanitizeFormat(),
    winston.format.json(),
  ),
  transports: [
    // Console transport (development)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp} [${context || 'Application'}] ${level}: ${message} ${metaStr}`;
        }),
      ),
    }),

    // Error log file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),

    // Combined log file
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),

    // CloudWatch transport (production only)
    // NOTE: Requires winston-cloudwatch package
    // Uncomment when deploying to AWS:
    // ...(process.env.NODE_ENV === 'production' && process.env.AWS_CLOUDWATCH_LOG_GROUP
    //   ? [
    //       new CloudWatchTransport({
    //         logGroupName: process.env.AWS_CLOUDWATCH_LOG_GROUP || '/aws/townin/backend',
    //         logStreamName: `${process.env.INSTANCE_ID || 'local'}-${Date.now()}`,
    //         awsRegion: process.env.AWS_REGION || 'ap-northeast-2',
    //         messageFormatter: ({ level, message, ...meta }) => {
    //           return JSON.stringify({ level, message, ...meta });
    //         },
    //       }),
    //     ]
    //   : []),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
};
