import { Module } from '@nestjs/common';
import { GraphRAGService } from './graphrag.service';
import { ChunkingService } from './services/chunking.service';
import { EntityExtractionService } from './services/entity-extraction.service';
import { Neo4jModule } from '../neo4j/neo4j.module';

@Module({
  imports: [Neo4jModule],
  providers: [
    GraphRAGService,
    ChunkingService,
    EntityExtractionService,
  ],
  exports: [GraphRAGService],
})
export class GraphRAGModule {}
