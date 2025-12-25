/**
 * GraphRAG Core Types
 * Based on Microsoft GraphRAG architecture
 */

export interface TextUnit {
  id: string;
  text: string;
  documentId: string;
  chunkIndex: number;
  startOffset: number;
  endOffset: number;
  metadata?: Record<string, any>;
}

export interface Entity {
  id: string;
  name: string;
  type: string; // Person, Location, Organization, Risk, Product, etc.
  description?: string;
  confidence: number;
  textUnits: string[]; // IDs of text units where this entity appears
  properties?: Record<string, any>;
}

export interface Relationship {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationshipType: string; // LIVES_IN, VIEWS, HIGH_RISK_OF, NEEDS, COVERS
  description?: string;
  confidence: number;
  textUnits: string[];
  weight?: number;
}

export interface Community {
  id: string;
  level: number; // Hierarchy level (0 = leaf, higher = more abstract)
  entities: string[]; // Entity IDs
  size: number;
  summary?: string;
  title?: string;
  parentCommunityId?: string;
  childCommunities?: string[];
}

export interface GraphRAGSearchResult {
  answer: string;
  confidence: number;
  citations: Citation[];
  entities: Entity[];
  communities: Community[];
  searchType: 'global' | 'local';
}

export interface Citation {
  textUnitId: string;
  text: string;
  relevanceScore: number;
  documentId?: string;
}

export interface LLMExtractionResult {
  entities: Entity[];
  relationships: Relationship[];
  rawResponse?: string;
}

export interface ChunkingConfig {
  chunkSize: number; // Target size in tokens/characters
  chunkOverlap: number; // Overlap between chunks
  preserveBoundaries: boolean; // Preserve sentence/paragraph boundaries
}

export interface GraphRAGConfig {
  chunking: ChunkingConfig;
  llmModel: string; // e.g., 'claude-3-5-sonnet-20241022'
  embeddingModel: string;
  clusteringAlgorithm: 'leiden' | 'louvain';
  maxCommunityLevel: number;
  confidenceThreshold: number;
}
