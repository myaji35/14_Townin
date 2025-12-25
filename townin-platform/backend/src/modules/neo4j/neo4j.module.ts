import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Neo4jService } from './neo4j.service';
import neo4j from 'neo4j-driver';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'NEO4J_DRIVER',
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('NEO4J_URI') || 'bolt://localhost:7687';
        const username = configService.get<string>('NEO4J_USERNAME') || 'neo4j';
        const password = configService.get<string>('NEO4J_PASSWORD') || 'townin_neo4j_password';

        const driver = neo4j.driver(
          uri,
          neo4j.auth.basic(username, password),
          {
            maxConnectionPoolSize: 100,
            connectionAcquisitionTimeout: 60000,
            maxTransactionRetryTime: 30000,
          }
        );

        // Verify connectivity
        await driver.verifyConnectivity();
        console.log('Neo4j Driver Connected');

        return driver;
      },
      inject: [ConfigService],
    },
    Neo4jService,
  ],
  exports: ['NEO4J_DRIVER', Neo4jService],
})
export class Neo4jModule {}
