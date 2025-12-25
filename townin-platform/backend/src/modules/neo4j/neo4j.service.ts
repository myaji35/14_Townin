import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { Driver, Session, QueryResult, Record as Neo4jRecord } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnModuleDestroy {
  // Neo4j service for graph database operations
  constructor(
    @Inject('NEO4J_DRIVER')
    private readonly driver: Driver,
  ) {}

  /**
   * Get a new session
   */
  getSession(database?: string): Session {
    return this.driver.session({
      database: database || 'neo4j',
      defaultAccessMode: 'WRITE',
    });
  }

  /**
   * Get a read-only session
   */
  getReadSession(database?: string): Session {
    return this.driver.session({
      database: database || 'neo4j',
      defaultAccessMode: 'READ',
    });
  }

  /**
   * Run a single query
   */
  async run(
    cypher: string,
    params?: { [key: string]: any },
    database?: string,
  ): Promise<QueryResult> {
    const session = this.getSession(database);
    try {
      return await session.run(cypher, params);
    } finally {
      await session.close();
    }
  }

  /**
   * Run a read-only query
   */
  async read(
    cypher: string,
    params?: { [key: string]: any },
    database?: string,
  ): Promise<QueryResult> {
    const session = this.getReadSession(database);
    try {
      return await session.run(cypher, params);
    } finally {
      await session.close();
    }
  }

  /**
   * Execute a write transaction
   */
  async write<T>(
    work: (tx: any) => Promise<T>,
    database?: string,
  ): Promise<T> {
    const session = this.getSession(database);
    try {
      return await session.executeWrite(work);
    } finally {
      await session.close();
    }
  }

  /**
   * Execute a read transaction
   */
  async readTransaction<T>(
    work: (tx: any) => Promise<T>,
    database?: string,
  ): Promise<T> {
    const session = this.getReadSession(database);
    try {
      return await session.executeRead(work);
    } finally {
      await session.close();
    }
  }

  /**
   * Create a User node
   */
  async createUser(userId: string, properties: { [key: string]: any } = {}): Promise<Neo4jRecord> {
    const cypher = `
      CREATE (u:User {userId: $userId})
      SET u += $properties
      RETURN u
    `;
    const result = await this.run(cypher, { userId, properties });
    return result.records[0];
  }

  /**
   * Create a Location node (H3 grid cell)
   */
  async createLocation(gridCellId: string, properties: { [key: string]: any } = {}): Promise<Neo4jRecord> {
    const cypher = `
      MERGE (l:Location {gridCellId: $gridCellId})
      SET l += $properties
      RETURN l
    `;
    const result = await this.run(cypher, { gridCellId, properties });
    return result.records[0];
  }

  /**
   * Create a Product node (Flyer item)
   */
  async createProduct(productId: string, properties: { [key: string]: any } = {}): Promise<Neo4jRecord> {
    const cypher = `
      CREATE (p:Product {productId: $productId})
      SET p += $properties
      RETURN p
    `;
    const result = await this.run(cypher, { productId, properties });
    return result.records[0];
  }

  /**
   * Create a Risk node
   */
  async createRisk(riskId: string, riskType: string, properties: { [key: string]: any } = {}): Promise<Neo4jRecord> {
    const cypher = `
      CREATE (r:Risk {riskId: $riskId, type: $riskType})
      SET r += $properties
      RETURN r
    `;
    const result = await this.run(cypher, { riskId, riskType, properties });
    return result.records[0];
  }

  /**
   * Create an InsuranceCoverage node
   */
  async createInsuranceCoverage(coverageId: string, properties: { [key: string]: any } = {}): Promise<Neo4jRecord> {
    const cypher = `
      CREATE (ic:InsuranceCoverage {coverageId: $coverageId})
      SET ic += $properties
      RETURN ic
    `;
    const result = await this.run(cypher, { coverageId, properties });
    return result.records[0];
  }

  /**
   * Create a LIVES_IN relationship
   */
  async createLivesInRelationship(userId: string, gridCellId: string, hubType: string): Promise<void> {
    const cypher = `
      MATCH (u:User {userId: $userId})
      MATCH (l:Location {gridCellId: $gridCellId})
      MERGE (u)-[r:LIVES_IN {hubType: $hubType}]->(l)
      RETURN r
    `;
    await this.run(cypher, { userId, gridCellId, hubType });
  }

  /**
   * Create a VIEWS relationship (user viewed a flyer)
   */
  async createViewsRelationship(userId: string, productId: string, viewedAt: Date): Promise<void> {
    const cypher = `
      MATCH (u:User {userId: $userId})
      MATCH (p:Product {productId: $productId})
      CREATE (u)-[r:VIEWS {viewedAt: datetime($viewedAt)}]->(p)
      RETURN r
    `;
    await this.run(cypher, { userId, productId, viewedAt: viewedAt.toISOString() });
  }

  /**
   * Create a HIGH_RISK_OF relationship
   */
  async createHighRiskOfRelationship(locationId: string, riskId: string, riskScore: number): Promise<void> {
    const cypher = `
      MATCH (l:Location {gridCellId: $locationId})
      MATCH (r:Risk {riskId: $riskId})
      MERGE (l)-[rel:HIGH_RISK_OF {score: $riskScore}]->(r)
      RETURN rel
    `;
    await this.run(cypher, { locationId, riskId, riskScore });
  }

  /**
   * Create a NEEDS relationship (user needs coverage)
   */
  async createNeedsRelationship(userId: string, coverageId: string, priority: number): Promise<void> {
    const cypher = `
      MATCH (u:User {userId: $userId})
      MATCH (ic:InsuranceCoverage {coverageId: $coverageId})
      MERGE (u)-[r:NEEDS {priority: $priority}]->(ic)
      RETURN r
    `;
    await this.run(cypher, { userId, coverageId, priority });
  }

  /**
   * Create a COVERS relationship (coverage covers risk)
   */
  async createCoversRelationship(coverageId: string, riskId: string): Promise<void> {
    const cypher = `
      MATCH (ic:InsuranceCoverage {coverageId: $coverageId})
      MATCH (r:Risk {riskId: $riskId})
      MERGE (ic)-[rel:COVERS]->(r)
      RETURN rel
    `;
    await this.run(cypher, { coverageId, riskId });
  }

  /**
   * Find users living in a specific location
   */
  async findUsersInLocation(gridCellId: string): Promise<any[]> {
    const cypher = `
      MATCH (u:User)-[:LIVES_IN]->(l:Location {gridCellId: $gridCellId})
      RETURN u
    `;
    const result = await this.read(cypher, { gridCellId });
    return result.records.map(record => record.get('u').properties);
  }

  /**
   * Find products viewed by a user
   */
  async findProductsViewedByUser(userId: string): Promise<any[]> {
    const cypher = `
      MATCH (u:User {userId: $userId})-[v:VIEWS]->(p:Product)
      RETURN p, v.viewedAt as viewedAt
      ORDER BY v.viewedAt DESC
    `;
    const result = await this.read(cypher, { userId });
    return result.records.map(record => ({
      product: record.get('p').properties,
      viewedAt: record.get('viewedAt'),
    }));
  }

  /**
   * Find risks for a location
   */
  async findRisksForLocation(gridCellId: string): Promise<any[]> {
    const cypher = `
      MATCH (l:Location {gridCellId: $gridCellId})-[rel:HIGH_RISK_OF]->(r:Risk)
      RETURN r, rel.score as riskScore
      ORDER BY rel.score DESC
    `;
    const result = await this.read(cypher, { gridCellId });
    return result.records.map(record => ({
      risk: record.get('r').properties,
      riskScore: record.get('riskScore'),
    }));
  }

  /**
   * Find recommended insurance coverage for a user based on their location risks
   */
  async findRecommendedCoverageForUser(userId: string): Promise<any[]> {
    const cypher = `
      MATCH (u:User {userId: $userId})-[:LIVES_IN]->(l:Location)-[:HIGH_RISK_OF]->(r:Risk)
      MATCH (ic:InsuranceCoverage)-[:COVERS]->(r)
      RETURN DISTINCT ic, COUNT(r) as relevantRisks
      ORDER BY relevantRisks DESC
      LIMIT 10
    `;
    const result = await this.read(cypher, { userId });
    return result.records.map(record => ({
      coverage: record.get('ic').properties,
      relevantRisks: record.get('relevantRisks').toNumber(),
    }));
  }

  /**
   * Initialize graph schema with constraints and indexes
   */
  async initializeSchema(): Promise<void> {
    const constraints = [
      'CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.userId IS UNIQUE',
      'CREATE CONSTRAINT location_id IF NOT EXISTS FOR (l:Location) REQUIRE l.gridCellId IS UNIQUE',
      'CREATE CONSTRAINT product_id IF NOT EXISTS FOR (p:Product) REQUIRE p.productId IS UNIQUE',
      'CREATE CONSTRAINT risk_id IF NOT EXISTS FOR (r:Risk) REQUIRE r.riskId IS UNIQUE',
      'CREATE CONSTRAINT coverage_id IF NOT EXISTS FOR (ic:InsuranceCoverage) REQUIRE ic.coverageId IS UNIQUE',
    ];

    for (const constraint of constraints) {
      try {
        await this.run(constraint);
        console.log(`Created constraint: ${constraint}`);
      } catch (error) {
        console.log(`Constraint may already exist: ${constraint}`);
      }
    }
  }

  /**
   * Clear all data (USE WITH CAUTION - for testing only)
   */
  async clearAll(): Promise<void> {
    const cypher = 'MATCH (n) DETACH DELETE n';
    await this.run(cypher);
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy() {
    await this.driver.close();
    console.log('Neo4j Driver Closed');
  }
}
