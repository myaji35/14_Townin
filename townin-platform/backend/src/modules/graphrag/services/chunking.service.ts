import { Injectable } from '@nestjs/common';
import { TextUnit, ChunkingConfig } from '../types/graphrag.types';

@Injectable()
export class ChunkingService {
  private readonly defaultConfig: ChunkingConfig = {
    chunkSize: 1000, // characters
    chunkOverlap: 200,
    preserveBoundaries: true,
  };

  /**
   * Split document into semantic chunks
   * Preserves sentence and paragraph boundaries for better context
   */
  chunkDocument(
    documentId: string,
    text: string,
    config: Partial<ChunkingConfig> = {},
  ): TextUnit[] {
    const finalConfig = { ...this.defaultConfig, ...config };
    const chunks: TextUnit[] = [];

    if (finalConfig.preserveBoundaries) {
      return this.chunkWithBoundaryPreservation(documentId, text, finalConfig);
    } else {
      return this.chunkSimple(documentId, text, finalConfig);
    }
  }

  /**
   * Simple chunking without boundary preservation
   */
  private chunkSimple(
    documentId: string,
    text: string,
    config: ChunkingConfig,
  ): TextUnit[] {
    const chunks: TextUnit[] = [];
    let startOffset = 0;
    let chunkIndex = 0;

    while (startOffset < text.length) {
      const endOffset = Math.min(
        startOffset + config.chunkSize,
        text.length,
      );
      const chunkText = text.substring(startOffset, endOffset);

      chunks.push({
        id: `${documentId}_chunk_${chunkIndex}`,
        text: chunkText,
        documentId,
        chunkIndex,
        startOffset,
        endOffset,
      });

      startOffset = endOffset - config.chunkOverlap;
      chunkIndex++;
    }

    return chunks;
  }

  /**
   * Advanced chunking with sentence/paragraph boundary preservation
   * Better for semantic understanding
   */
  private chunkWithBoundaryPreservation(
    documentId: string,
    text: string,
    config: ChunkingConfig,
  ): TextUnit[] {
    const chunks: TextUnit[] = [];

    // Split by paragraphs first
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

    let currentChunk = '';
    let startOffset = 0;
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
      const sentences = this.splitIntoSentences(paragraph);

      for (const sentence of sentences) {
        // If adding this sentence would exceed chunk size
        if (currentChunk.length + sentence.length > config.chunkSize && currentChunk.length > 0) {
          // Save current chunk
          const endOffset = startOffset + currentChunk.length;
          chunks.push({
            id: `${documentId}_chunk_${chunkIndex}`,
            text: currentChunk.trim(),
            documentId,
            chunkIndex,
            startOffset,
            endOffset,
          });

          // Start new chunk with overlap
          const overlapText = this.getOverlapText(currentChunk, config.chunkOverlap);
          currentChunk = overlapText + sentence;
          startOffset = endOffset - overlapText.length;
          chunkIndex++;
        } else {
          currentChunk += (currentChunk.length > 0 ? ' ' : '') + sentence;
        }
      }

      // Add paragraph break
      currentChunk += '\n\n';
    }

    // Save final chunk
    if (currentChunk.trim().length > 0) {
      const endOffset = startOffset + currentChunk.length;
      chunks.push({
        id: `${documentId}_chunk_${chunkIndex}`,
        text: currentChunk.trim(),
        documentId,
        chunkIndex,
        startOffset,
        endOffset,
      });
    }

    return chunks;
  }

  /**
   * Split paragraph into sentences
   */
  private splitIntoSentences(text: string): string[] {
    // Simple sentence splitting (can be enhanced with NLP library)
    const sentenceRegex = /[^.!?]+[.!?]+/g;
    const sentences = text.match(sentenceRegex) || [text];
    return sentences.map(s => s.trim()).filter(s => s.length > 0);
  }

  /**
   * Get overlap text from end of chunk
   */
  private getOverlapText(text: string, overlapSize: number): string {
    if (text.length <= overlapSize) {
      return text;
    }

    // Try to get overlap at sentence boundary
    const overlapText = text.substring(text.length - overlapSize);
    const lastSentenceStart = overlapText.lastIndexOf('. ');

    if (lastSentenceStart > 0) {
      return overlapText.substring(lastSentenceStart + 2);
    }

    return overlapText;
  }

  /**
   * Chunk insurance policy document
   * Special handling for clauses and sections
   */
  chunkInsurancePolicy(documentId: string, policyText: string): TextUnit[] {
    const chunks: TextUnit[] = [];

    // Split by sections (typically numbered: 1., 2., Article 1, etc.)
    const sectionRegex = /(?:^|\n)(?:제?\s*\d+\s*조|Article\s+\d+|Section\s+\d+|\d+\.)/gm;
    const sections = policyText.split(sectionRegex);

    let chunkIndex = 0;
    let currentOffset = 0;

    for (const section of sections) {
      if (section.trim().length === 0) continue;

      // If section is too large, chunk it further
      if (section.length > this.defaultConfig.chunkSize) {
        const subChunks = this.chunkDocument(documentId, section, {
          chunkSize: 800,
          chunkOverlap: 150,
        });

        subChunks.forEach(subChunk => {
          chunks.push({
            ...subChunk,
            id: `${documentId}_policy_${chunkIndex}`,
            chunkIndex,
            startOffset: currentOffset + subChunk.startOffset,
            metadata: { type: 'policy_clause' },
          });
          chunkIndex++;
        });
      } else {
        chunks.push({
          id: `${documentId}_policy_${chunkIndex}`,
          text: section.trim(),
          documentId,
          chunkIndex,
          startOffset: currentOffset,
          endOffset: currentOffset + section.length,
          metadata: { type: 'policy_section' },
        });
        chunkIndex++;
      }

      currentOffset += section.length;
    }

    return chunks;
  }
}
