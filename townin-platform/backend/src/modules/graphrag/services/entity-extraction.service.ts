import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import {
  TextUnit,
  Entity,
  Relationship,
  LLMExtractionResult,
} from '../types/graphrag.types';

@Injectable()
export class EntityExtractionService {
  private readonly anthropic: Anthropic;
  private readonly model: string = 'claude-3-5-sonnet-20241022';

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    this.anthropic = new Anthropic({ apiKey });
  }

  /**
   * Extract entities and relationships from text using Claude
   */
  async extractFromTextUnit(textUnit: TextUnit): Promise<LLMExtractionResult> {
    const prompt = this.buildExtractionPrompt(textUnit.text);

    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4096,
        temperature: 0.3, // Lower temperature for more consistent extraction
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return this.parseExtractionResponse(content.text, textUnit);
    } catch (error) {
      console.error('Entity extraction failed:', error);
      throw error;
    }
  }

  /**
   * Build extraction prompt for Claude
   */
  private buildExtractionPrompt(text: string): string {
    return `You are an expert knowledge graph extraction system for a hyper-local insurance and lifestyle platform called Townin.

Extract entities and relationships from the following text. Focus on:
- **People**: Users, family members, residents
- **Locations**: H3 grid cells, neighborhoods, addresses, POIs
- **Products**: Flyers, items, services being advertised
- **Risks**: Safety risks, health risks, environmental risks
- **Insurance**: Coverage types, policies, claims
- **Organizations**: Merchants, businesses, government agencies

For each entity, provide:
- name: The entity name
- type: One of [Person, Location, Product, Risk, Insurance, Organization, Event]
- description: Brief description (1-2 sentences)
- confidence: 0.0 to 1.0

For each relationship, provide:
- source: Source entity name
- target: Target entity name
- type: Relationship type (e.g., LIVES_IN, VIEWS, HIGH_RISK_OF, NEEDS, COVERS, OWNS, WORKS_AT)
- description: Brief description of the relationship
- confidence: 0.0 to 1.0

Return ONLY valid JSON in this exact format:
{
  "entities": [
    {
      "name": "entity name",
      "type": "Person|Location|Product|Risk|Insurance|Organization|Event",
      "description": "description",
      "confidence": 0.95
    }
  ],
  "relationships": [
    {
      "source": "entity1 name",
      "target": "entity2 name",
      "type": "RELATIONSHIP_TYPE",
      "description": "description",
      "confidence": 0.9
    }
  ]
}

Text to analyze:
---
${text}
---

JSON output:`;
  }

  /**
   * Parse Claude's JSON response into entities and relationships
   */
  private parseExtractionResponse(
    response: string,
    textUnit: TextUnit,
  ): LLMExtractionResult {
    try {
      // Extract JSON from response (Claude sometimes adds explanation)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      const entities: Entity[] = (parsed.entities || []).map((e: any, index: number) => ({
        id: `${textUnit.id}_entity_${index}`,
        name: e.name,
        type: e.type,
        description: e.description,
        confidence: e.confidence || 0.8,
        textUnits: [textUnit.id],
        properties: e.properties || {},
      }));

      const relationships: Relationship[] = (parsed.relationships || []).map(
        (r: any, index: number) => ({
          id: `${textUnit.id}_rel_${index}`,
          sourceEntityId: r.source, // Will need to resolve to actual entity ID
          targetEntityId: r.target,
          relationshipType: r.type,
          description: r.description,
          confidence: r.confidence || 0.8,
          textUnits: [textUnit.id],
        }),
      );

      return {
        entities,
        relationships,
        rawResponse: response,
      };
    } catch (error) {
      console.error('Failed to parse extraction response:', error);
      console.error('Response was:', response);
      throw new Error('Failed to parse LLM extraction response');
    }
  }

  /**
   * Batch extraction for multiple text units
   */
  async extractBatch(textUnits: TextUnit[]): Promise<LLMExtractionResult[]> {
    const results: LLMExtractionResult[] = [];

    // Process in parallel with concurrency limit
    const concurrencyLimit = 5;
    for (let i = 0; i < textUnits.length; i += concurrencyLimit) {
      const batch = textUnits.slice(i, i + concurrencyLimit);
      const batchResults = await Promise.all(
        batch.map(unit => this.extractFromTextUnit(unit)),
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Extract entities from insurance claim description
   * Specialized for insurance domain
   */
  async extractFromClaim(claimText: string): Promise<LLMExtractionResult> {
    const specializedPrompt = `You are analyzing an insurance claim. Extract:
- Claimant information (Person)
- Incident location (Location)
- Damaged items/property (Product)
- Risk/hazard involved (Risk)
- Insurance coverage type (Insurance)

Text: ${claimText}

Return JSON with entities and relationships:`;

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 2048,
      temperature: 0.2,
      messages: [{ role: 'user', content: specializedPrompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    return this.parseExtractionResponse(content.text, {
      id: 'claim_temp',
      text: claimText,
      documentId: 'claim',
      chunkIndex: 0,
      startOffset: 0,
      endOffset: claimText.length,
    });
  }

  /**
   * Merge duplicate entities from multiple extractions
   */
  mergeEntities(entities: Entity[]): Entity[] {
    const entityMap = new Map<string, Entity>();

    for (const entity of entities) {
      const key = `${entity.name.toLowerCase()}_${entity.type}`;

      if (entityMap.has(key)) {
        const existing = entityMap.get(key)!;
        // Merge text units
        existing.textUnits.push(...entity.textUnits);
        // Update confidence (take max)
        existing.confidence = Math.max(existing.confidence, entity.confidence);
        // Merge properties
        existing.properties = { ...existing.properties, ...entity.properties };
      } else {
        entityMap.set(key, { ...entity });
      }
    }

    return Array.from(entityMap.values());
  }
}
