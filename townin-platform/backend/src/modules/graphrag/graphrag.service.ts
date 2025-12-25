import { Injectable } from '@nestjs/common';
import { ChunkingService } from './services/chunking.service';
import { EntityExtractionService } from './services/entity-extraction.service';
import { Neo4jService } from '../neo4j/neo4j.service';
import {
  TextUnit,
  Entity,
  Relationship,
  GraphRAGSearchResult,
  GraphRAGConfig,
} from './types/graphrag.types';

@Injectable()
export class GraphRAGService {
  private readonly config: GraphRAGConfig = {
    chunking: {
      chunkSize: 1000,
      chunkOverlap: 200,
      preserveBoundaries: true,
    },
    llmModel: 'claude-3-5-sonnet-20241022',
    embeddingModel: 'text-embedding-3-small',
    clusteringAlgorithm: 'leiden',
    maxCommunityLevel: 3,
    confidenceThreshold: 0.7,
  };

  constructor(
    private readonly chunkingService: ChunkingService,
    private readonly entityExtractionService: EntityExtractionService,
    private readonly neo4jService: Neo4jService,
  ) {}

  /**
   * Process document through GraphRAG pipeline
   * 1. Chunk document
   * 2. Extract entities and relationships
   * 3. Store in Neo4j graph
   */
  async processDocument(documentId: string, text: string): Promise<{
    chunks: number;
    entities: number;
    relationships: number;
  }> {
    console.log(`Processing document ${documentId}...`);

    // Step 1: Chunk document
    console.log('Step 1: Chunking document...');
    const chunks = this.chunkingService.chunkDocument(documentId, text);
    console.log(`Created ${chunks.length} chunks`);

    // Step 2: Extract entities and relationships from each chunk
    console.log('Step 2: Extracting entities and relationships...');
    const extractionResults = await this.entityExtractionService.extractBatch(chunks);

    // Merge all entities
    const allEntities: Entity[] = [];
    const allRelationships: Relationship[] = [];

    extractionResults.forEach(result => {
      allEntities.push(...result.entities);
      allRelationships.push(...result.relationships);
    });

    // Deduplicate entities
    const mergedEntities = this.entityExtractionService.mergeEntities(allEntities);
    console.log(`Extracted ${mergedEntities.length} unique entities`);

    // Step 3: Store in Neo4j
    console.log('Step 3: Storing in Neo4j graph...');
    await this.storeInGraph(mergedEntities, allRelationships);

    return {
      chunks: chunks.length,
      entities: mergedEntities.length,
      relationships: allRelationships.length,
    };
  }

  /**
   * Store entities and relationships in Neo4j
   */
  private async storeInGraph(
    entities: Entity[],
    relationships: Relationship[],
  ): Promise<void> {
    // Create entity nodes
    for (const entity of entities) {
      await this.createEntityNode(entity);
    }

    // Create relationships
    for (const rel of relationships) {
      await this.createRelationshipEdge(rel, entities);
    }
  }

  /**
   * Create entity node in Neo4j
   */
  private async createEntityNode(entity: Entity): Promise<void> {
    const cypher = `
      MERGE (e:Entity {name: $name, type: $type})
      SET e.description = $description,
          e.confidence = $confidence,
          e.properties = $properties
      RETURN e
    `;

    await this.neo4jService.run(cypher, {
      name: entity.name,
      type: entity.type,
      description: entity.description || '',
      confidence: entity.confidence,
      properties: entity.properties || {},
    });
  }

  /**
   * Create relationship edge in Neo4j
   */
  private async createRelationshipEdge(
    relationship: Relationship,
    entities: Entity[],
  ): Promise<void> {
    // Find entity IDs by name
    const sourceEntity = entities.find(e => e.name === relationship.sourceEntityId);
    const targetEntity = entities.find(e => e.name === relationship.targetEntityId);

    if (!sourceEntity || !targetEntity) {
      console.warn(`Could not resolve entities for relationship: ${relationship.id}`);
      return;
    }

    const cypher = `
      MATCH (source:Entity {name: $sourceName})
      MATCH (target:Entity {name: $targetName})
      MERGE (source)-[r:${relationship.relationshipType}]->(target)
      SET r.description = $description,
          r.confidence = $confidence
      RETURN r
    `;

    await this.neo4jService.run(cypher, {
      sourceName: sourceEntity.name,
      targetName: targetEntity.name,
      description: relationship.description || '',
      confidence: relationship.confidence,
    });
  }

  /**
   * Global search: Answer broad questions using community summaries
   */
  async globalSearch(query: string): Promise<GraphRAGSearchResult> {
    // TODO: Implement community-based search
    // For now, return basic graph query
    const cypher = `
      MATCH (e:Entity)
      WHERE e.name CONTAINS $query OR e.description CONTAINS $query
      RETURN e
      LIMIT 10
    `;

    const result = await this.neo4jService.read(cypher, { query });
    const entities = result.records.map(r => r.get('e').properties);

    return {
      answer: `Found ${entities.length} related entities for: "${query}"`,
      confidence: 0.8,
      citations: [],
      entities: entities,
      communities: [],
      searchType: 'global',
    };
  }

  /**
   * Local search: Answer specific questions using graph traversal
   */
  async localSearch(query: string, entityName: string): Promise<GraphRAGSearchResult> {
    const cypher = `
      MATCH (e:Entity {name: $entityName})-[r]-(related:Entity)
      RETURN e, r, related
      LIMIT 20
    `;

    const result = await this.neo4jService.read(cypher, { entityName });

    return {
      answer: `Found ${result.records.length} relationships for: "${entityName}"`,
      confidence: 0.85,
      citations: [],
      entities: [],
      communities: [],
      searchType: 'local',
    };
  }

  /**
   * Find insurance coverage recommendations for a user
   */
  async getInsuranceRecommendations(userId: string): Promise<any[]> {
    return await this.neo4jService.findRecommendedCoverageForUser(userId);
  }

  /**
   * Analyze insurance claim using GraphRAG
   */
  async analyzeInsuranceClaim(claimText: string): Promise<{
    entities: Entity[];
    riskAssessment: string;
    coverageMatches: any[];
  }> {
    // Extract entities from claim
    const extraction = await this.entityExtractionService.extractFromClaim(claimText);

    // Find related risks in graph
    const risks = extraction.entities.filter(e => e.type === 'Risk');

    return {
      entities: extraction.entities,
      riskAssessment: `Identified ${risks.length} risks in claim`,
      coverageMatches: [],
    };
  }
}
