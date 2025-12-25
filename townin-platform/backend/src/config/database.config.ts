import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Parse DATABASE_URL if available (for Cloud Run with Cloud SQL)
function getDatabaseConfig(): TypeOrmModuleOptions {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    // Parse PostgreSQL connection URL
    // Format: postgresql://user:password@host/database?host=/cloudsql/instance
    // Or for Cloud SQL socket: postgresql://user:password@/database?host=/cloudsql/instance

    try {
      // Extract components manually for Cloud SQL socket path format
      const match = databaseUrl.match(/^postgresql:\/\/([^:]+):([^@]+)@([^/]*)\/([^?]+)(\?.*)?$/);

      if (!match) {
        throw new Error('Invalid DATABASE_URL format');
      }

      const username = match[1];
      const password = match[2];
      const hostPart = match[3]; // empty for socket connections
      const database = match[4];
      const queryString = match[5] || '';

      const params = new URLSearchParams(queryString);
      const socketPath = params.get('host');

      const baseConfig = {
        type: 'postgres' as const,
        username,
        password,
        database,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development',
      };

      if (socketPath) {
        // Use Unix socket for Cloud SQL
        return {
          ...baseConfig,
          extra: {
            host: socketPath,
          },
        };
      } else if (hostPart) {
        // Use TCP connection
        const [hostname, portStr] = hostPart.split(':');
        return {
          ...baseConfig,
          host: hostname,
          port: portStr ? parseInt(portStr, 10) : 5432,
        };
      }

      return baseConfig;
    } catch (error) {
      console.error('Failed to parse DATABASE_URL:', error);
      // Fall through to use individual environment variables
    }
  }

  // Fallback to individual environment variables (for local development)
  const password = process.env.DB_PASSWORD;
  const config = {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 15432,
    username: process.env.DB_USERNAME || 'townin',
    password: password && password.length > 0 ? password : undefined,
    database: process.env.DB_DATABASE || 'townin-db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
  };

  console.log('TypeORM Database Config:', {
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password === undefined ? 'undefined' : '***',
    database: config.database,
  });

  return config;
}

export const databaseConfig: TypeOrmModuleOptions = getDatabaseConfig();
