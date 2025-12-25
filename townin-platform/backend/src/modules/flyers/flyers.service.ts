import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flyer, FlyerStatus, FlyerCategory } from './flyer.entity';
import { FlyerProduct } from './flyer-product.entity';
import { CreateFlyerDto } from './dto/create-flyer.dto';
import { UpdateFlyerDto } from './dto/update-flyer.dto';
import { AnalyzeFlyerResponseDto, AnalyzedProductDto } from './dto/analyze-flyer.dto';
import { BatchCreateFlyerDto } from './dto/batch-create-flyer.dto';
import { FlyerAdSettingsDto, TrackFlyerViewDto, FlyerAdStatsDto } from './dto/flyer-ad-settings.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';

@Injectable()
export class FlyersService {
  private openai: OpenAI;
  private anthropic: Anthropic;

  constructor(
    @InjectRepository(Flyer)
    private flyerRepository: Repository<Flyer>,
    @InjectRepository(FlyerProduct)
    private flyerProductRepository: Repository<FlyerProduct>,
    private eventEmitter: EventEmitter2,
  ) {
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });

    // Initialize Anthropic Claude client
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }

  async findAll(): Promise<Flyer[]> {
    return await this.flyerRepository.find({
      where: { isActive: true },
      relations: ['merchant'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<any> {
    const flyer = await this.flyerRepository.findOne({
      where: { id, isActive: true },
      relations: ['merchant'],
    });

    if (!flyer) {
      throw new NotFoundException('Flyer not found');
    }

    const products = await this.flyerProductRepository.find({
      where: { flyerId: id },
      order: { displayOrder: 'ASC' },
    });

    return {
      ...flyer,
      products,
    };
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.flyerRepository.increment({ id }, 'viewCount', 1);
  }

  async incrementClickCount(id: string): Promise<void> {
    await this.flyerRepository.increment({ id }, 'clickCount', 1);
  }

  async findByMerchant(merchantId: string): Promise<Flyer[]> {
    return await this.flyerRepository.find({
      where: { merchantId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findNearby(gridCell: string): Promise<Flyer[]> {
    // This would typically use spatial queries, but for now we'll just return active flyers
    return await this.flyerRepository
      .createQueryBuilder('flyer')
      .leftJoinAndSelect('flyer.merchant', 'merchant')
      .where('flyer.is_active = :isActive', { isActive: true })
      .andWhere('merchant.grid_cell = :gridCell', { gridCell })
      .orderBy('flyer.created_at', 'DESC')
      .take(10)
      .getMany();
  }

  async create(merchantId: string, createFlyerDto: CreateFlyerDto): Promise<Flyer> {
    const flyer = this.flyerRepository.create({
      ...createFlyerDto,
      merchantId,
      aiProcessingStatus: 'pending',
    });

    const savedFlyer = await this.flyerRepository.save(flyer);

    // Create products if provided
    if (createFlyerDto.products && createFlyerDto.products.length > 0) {
      const products = createFlyerDto.products.map((product, index) => {
        return this.flyerProductRepository.create({
          ...product,
          flyerId: savedFlyer.id,
          displayOrder: product.displayOrder ?? index,
        });
      });

      await this.flyerProductRepository.save(products);
    }

    return savedFlyer;
  }

  async update(id: string, merchantId: string, updateFlyerDto: UpdateFlyerDto): Promise<Flyer> {
    const flyer = await this.flyerRepository.findOne({
      where: { id, merchantId },
    });

    if (!flyer) {
      throw new NotFoundException('Flyer not found or you do not have permission to update it');
    }

    // Update flyer
    Object.assign(flyer, updateFlyerDto);
    const updatedFlyer = await this.flyerRepository.save(flyer);

    // Update products if provided
    if (updateFlyerDto.products) {
      // Delete existing products
      await this.flyerProductRepository.delete({ flyerId: id });

      // Create new products
      if (updateFlyerDto.products.length > 0) {
        const products = updateFlyerDto.products.map((product, index) => {
          return this.flyerProductRepository.create({
            ...product,
            flyerId: id,
            displayOrder: product.displayOrder ?? index,
          });
        });

        await this.flyerProductRepository.save(products);
      }
    }

    return updatedFlyer;
  }

  async delete(id: string, merchantId: string): Promise<void> {
    const flyer = await this.flyerRepository.findOne({
      where: { id, merchantId },
    });

    if (!flyer) {
      throw new NotFoundException('Flyer not found or you do not have permission to delete it');
    }

    // Soft delete by setting isActive to false
    flyer.isActive = false;
    await this.flyerRepository.save(flyer);
  }

  // =====================================
  // Admin Methods (Approval Workflow)
  // =====================================

  /**
   * Get all flyers pending approval
   */
  async getPendingFlyers(page: number = 1, limit: number = 20): Promise<{ data: Flyer[]; total: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.flyerRepository
      .createQueryBuilder('flyer')
      .leftJoinAndSelect('flyer.merchant', 'merchant')
      .where('flyer.status = :status', { status: FlyerStatus.PENDING_APPROVAL })
      .andWhere('flyer.deleted_at IS NULL')
      .orderBy('flyer.created_at', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  /**
   * Approve flyer (Admin only)
   */
  async approveFlyer(flyerId: string, adminId: string): Promise<Flyer> {
    const flyer = await this.flyerRepository.findOne({
      where: { id: flyerId },
      relations: ['merchant'],
    });

    if (!flyer) {
      throw new NotFoundException('Flyer not found');
    }

    if (flyer.status === FlyerStatus.APPROVED) {
      throw new Error('Flyer is already approved');
    }

    flyer.status = FlyerStatus.APPROVED;
    const approvedFlyer = await this.flyerRepository.save(flyer);

    // Emit event for notification (optional)
    this.eventEmitter.emit('flyer.approved', {
      flyerId: flyer.id,
      merchantId: flyer.merchantId,
      adminId,
      timestamp: new Date(),
    });

    return approvedFlyer;
  }

  /**
   * Reject flyer (Admin only)
   */
  async rejectFlyer(flyerId: string, adminId: string, reason?: string): Promise<Flyer> {
    const flyer = await this.flyerRepository.findOne({
      where: { id: flyerId },
      relations: ['merchant'],
    });

    if (!flyer) {
      throw new NotFoundException('Flyer not found');
    }

    flyer.status = FlyerStatus.REJECTED;
    const rejectedFlyer = await this.flyerRepository.save(flyer);

    // Emit event for notification (optional)
    this.eventEmitter.emit('flyer.rejected', {
      flyerId: flyer.id,
      merchantId: flyer.merchantId,
      adminId,
      reason,
      timestamp: new Date(),
    });

    return rejectedFlyer;
  }

  /**
   * Get flyers by status (Admin)
   */
  async getFlyersByStatus(
    status: FlyerStatus,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Flyer[]; total: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.flyerRepository
      .createQueryBuilder('flyer')
      .leftJoinAndSelect('flyer.merchant', 'merchant')
      .where('flyer.status = :status', { status })
      .andWhere('flyer.deleted_at IS NULL')
      .orderBy('flyer.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  // =====================================
  // User-facing Methods (USR-007)
  // =====================================

  /**
   * Get active approved flyers near user location (H3 grid-based)
   */
  async getFlyersByLocation(
    h3Index: string,
    radius: number = 1,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Flyer[]; total: number }> {
    const skip = (page - 1) * limit;

    // For now, we'll use merchant grid_cell for proximity
    // In production, this should use H3 k-ring queries
    const [data, total] = await this.flyerRepository
      .createQueryBuilder('flyer')
      .leftJoinAndSelect('flyer.merchant', 'merchant')
      .where('flyer.is_active = :isActive', { isActive: true })
      .andWhere('flyer.status = :status', { status: FlyerStatus.APPROVED })
      .andWhere('flyer.deleted_at IS NULL')
      .andWhere(
        '(flyer.expires_at IS NULL OR flyer.expires_at > :now)',
        { now: new Date() },
      )
      .andWhere(
        '(flyer.start_date IS NULL OR flyer.start_date <= :now)',
        { now: new Date() },
      )
      .orderBy('flyer.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  /**
   * Search flyers by keyword (title, description)
   */
  async searchFlyers(
    keyword: string,
    category?: FlyerCategory,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Flyer[]; total: number }> {
    const skip = (page - 1) * limit;

    const query = this.flyerRepository
      .createQueryBuilder('flyer')
      .leftJoinAndSelect('flyer.merchant', 'merchant')
      .where('flyer.is_active = :isActive', { isActive: true })
      .andWhere('flyer.status = :status', { status: FlyerStatus.APPROVED })
      .andWhere('flyer.deleted_at IS NULL')
      .andWhere(
        '(flyer.expires_at IS NULL OR flyer.expires_at > :now)',
        { now: new Date() },
      )
      .andWhere(
        '(flyer.title ILIKE :keyword OR flyer.description ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      );

    if (category) {
      query.andWhere('flyer.category = :category', { category });
    }

    const [data, total] = await query
      .orderBy('flyer.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  /**
   * Get flyers by category
   */
  async getFlyersByCategory(
    category: FlyerCategory,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Flyer[]; total: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.flyerRepository
      .createQueryBuilder('flyer')
      .leftJoinAndSelect('flyer.merchant', 'merchant')
      .where('flyer.is_active = :isActive', { isActive: true })
      .andWhere('flyer.status = :status', { status: FlyerStatus.APPROVED })
      .andWhere('flyer.category = :category', { category })
      .andWhere('flyer.deleted_at IS NULL')
      .andWhere(
        '(flyer.expires_at IS NULL OR flyer.expires_at > :now)',
        { now: new Date() },
      )
      .orderBy('flyer.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  /**
   * Get featured flyers (high engagement)
   */
  async getFeaturedFlyers(limit: number = 10): Promise<Flyer[]> {
    return await this.flyerRepository
      .createQueryBuilder('flyer')
      .leftJoinAndSelect('flyer.merchant', 'merchant')
      .where('flyer.is_active = :isActive', { isActive: true })
      .andWhere('flyer.status = :status', { status: FlyerStatus.APPROVED })
      .andWhere('flyer.deleted_at IS NULL')
      .andWhere(
        '(flyer.expires_at IS NULL OR flyer.expires_at > :now)',
        { now: new Date() },
      )
      .orderBy('flyer.view_count', 'DESC')
      .addOrderBy('flyer.click_count', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * Track flyer view (analytics integration)
   */
  async trackFlyerView(flyerId: string, userId?: string): Promise<void> {
    await this.incrementViewCount(flyerId);

    // Emit event for analytics
    this.eventEmitter.emit('flyer.viewed', {
      flyerId,
      userId,
      timestamp: new Date(),
    });
  }

  /**
   * Track flyer click (user opened details)
   */
  async trackFlyerClick(flyerId: string, userId?: string): Promise<void> {
    await this.incrementClickCount(flyerId);

    // Emit event for analytics
    this.eventEmitter.emit('flyer.clicked', {
      flyerId,
      userId,
      timestamp: new Date(),
    });
  }

  // =====================================
  // AI OCR & Batch Creation Methods
  // =====================================

  /**
   * Analyze flyer image/PDF with AI OCR using OpenAI Vision API
   */
  async analyzeFlyerWithAI(fileBuffer?: Buffer, imageUrl?: string): Promise<AnalyzeFlyerResponseDto> {
    try {
      // Convert buffer to base64 if provided
      let base64Image: string;

      if (fileBuffer) {
        base64Image = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
      } else if (imageUrl) {
        base64Image = imageUrl;
      } else {
        throw new Error('Either fileBuffer or imageUrl must be provided');
      }

      // Call OpenAI Vision API with detailed prompt for product extraction
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `이 전단지 이미지를 분석하여 **모든 상품**을 감지해주세요.

각 상품에 대해 다음 정보를 추출하세요:
- 제목 (상품명)
- 설명 (상품 상세 정보, 특징)
- 가격 (할인가 또는 판매가)
- 카테고리 (식품, 음식점, 카페, 생활, 운동, 교육, 의료, 기타 중 하나)

**중요**:
- 전단지에 있는 **모든 상품**을 빠짐없이 감지하세요 (40개 이상일 수도 있음)
- 작은 글씨나 구석에 있는 상품도 모두 포함하세요
- 각 상품을 개별적으로 분리하세요

다음 JSON 형식으로 **정확히** 응답하세요:
{
  "products": [
    {
      "title": "상품명",
      "description": "상품 설명",
      "price": "가격",
      "category": "카테고리"
    }
  ],
  "summary": "전단지 전체 요약 (상호명, 연락처, 영업시간 등 포함)"
}`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image,
                  detail: 'high', // High detail for better product detection
                },
              },
            ],
          },
        ],
        max_tokens: 4096,
        temperature: 0.2, // Low temperature for more consistent results
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from OpenAI Vision API');
      }

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from OpenAI');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const products: AnalyzedProductDto[] = parsed.products || [];
      const summary = parsed.summary || '';

      // Format extracted text
      const extractedText = `
=== AI가 전단지에서 감지한 상품들 ===

총 ${products.length}개의 상품이 발견되었습니다!

${products.map((p, i) => `${i + 1}. ${p.title}
   - ${p.description}
   - 가격: ${p.price}
   - 카테고리: ${p.category}`).join('\n\n')}

📋 전단지 요약:
${summary}
      `.trim();

      return {
        extractedText,
        products,
        imageUrl: base64Image,
      };

    } catch (error) {
      console.error('OpenAI Vision API Error:', error);
      console.log('🔄 Trying Claude Vision API as fallback...');

      // Try Claude Vision API as fallback
      try {
        return await this.analyzeWithClaude(fileBuffer, imageUrl);
      } catch (claudeError) {
        console.error('Claude Vision API Error:', claudeError);
        console.log('🔄 Trying Google Cloud Vision API as fallback...');

        // Try Google Cloud Vision API as third fallback
        try {
          return await this.analyzeWithGoogleVision(fileBuffer, imageUrl);
        } catch (googleError) {
          console.error('Google Cloud Vision API Error:', googleError);

          // Final fallback to mock data if all APIs fail
          const fallbackProducts: AnalyzedProductDto[] = [
            {
              title: 'AI 분석 실패 - 모든 API 실패',
              description: 'OpenAI, Anthropic, Google Vision API 모두 실패했습니다',
              category: '기타',
              price: '0원',
            },
          ];

          return {
            extractedText: `⚠️ AI 분석 실패 (모든 AI 서비스 실패)\n\nOpenAI 오류: ${error.message}\nClaude 오류: ${claudeError.message}\nGoogle Vision 오류: ${googleError.message}\n\nAPI 키를 .env 파일에 설정하거나, 할당량을 확인해주세요.`,
            products: fallbackProducts,
            imageUrl,
          };
        }
      }
    }
  }

  /**
   * Analyze flyer image with Claude Vision API (fallback option)
   */
  private async analyzeWithClaude(fileBuffer?: Buffer, imageUrl?: string): Promise<AnalyzeFlyerResponseDto> {
    // Convert buffer to base64 if provided
    let base64Image: string;
    let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg';

    if (fileBuffer) {
      base64Image = fileBuffer.toString('base64');
    } else if (imageUrl) {
      // If imageUrl is already base64, extract the base64 part
      if (imageUrl.startsWith('data:')) {
        const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          mediaType = matches[1] as any;
          base64Image = matches[2];
        } else {
          throw new Error('Invalid base64 image URL format');
        }
      } else {
        throw new Error('imageUrl must be a base64 data URL for Claude API');
      }
    } else {
      throw new Error('Either fileBuffer or imageUrl must be provided');
    }

    // Call Claude Vision API
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `이 전단지 이미지를 분석하여 **모든 상품**을 감지해주세요.

각 상품에 대해 다음 정보를 추출하세요:
- 제목 (상품명)
- 설명 (상품 상세 정보, 특징)
- 가격 (할인가 또는 판매가)
- 카테고리 (식품, 음식점, 카페, 생활, 운동, 교육, 의료, 기타 중 하나)

**중요**:
- 전단지에 있는 **모든 상품**을 빠짐없이 감지하세요 (40개 이상일 수도 있음)
- 작은 글씨나 구석에 있는 상품도 모두 포함하세요
- 각 상품을 개별적으로 분리하세요

다음 JSON 형식으로 **정확히** 응답하세요:
{
  "products": [
    {
      "title": "상품명",
      "description": "상품 설명",
      "price": "가격",
      "category": "카테고리"
    }
  ],
  "summary": "전단지 전체 요약 (상호명, 연락처, 영업시간 등 포함)"
}`,
            },
          ],
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse JSON response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Claude');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const products: AnalyzedProductDto[] = parsed.products || [];
    const summary = parsed.summary || '';

    // Format extracted text
    const extractedText = `
=== Claude AI가 전단지에서 감지한 상품들 ===

총 ${products.length}개의 상품이 발견되었습니다!

${products.map((p, i) => `${i + 1}. ${p.title}
   - ${p.description}
   - 가격: ${p.price}
   - 카테고리: ${p.category}`).join('\n\n')}

📋 전단지 요약:
${summary}
    `.trim();

    return {
      extractedText,
      products,
      imageUrl: imageUrl || `data:${mediaType};base64,${base64Image}`,
    };
  }

  /**
   * Analyze flyer image with Google Cloud Vision API (third fallback option)
   * Uses REST API with API key instead of SDK
   */
  private async analyzeWithGoogleVision(fileBuffer?: Buffer, imageUrl?: string): Promise<AnalyzeFlyerResponseDto> {
    let imageData: Buffer;

    if (fileBuffer) {
      imageData = fileBuffer;
    } else if (imageUrl && imageUrl.startsWith('data:')) {
      // Extract base64 data from data URL
      const base64Data = imageUrl.split(',')[1];
      imageData = Buffer.from(base64Data, 'base64');
    } else {
      throw new Error('Either fileBuffer or imageUrl must be provided');
    }

    // Get API key from environment
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    if (!apiKey) {
      throw new Error('Google Cloud Vision API key not configured');
    }

    // Convert image to base64
    const base64Image = imageData.toString('base64');

    // Call Google Cloud Vision API REST endpoint
    const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    try {
      const response = await axios.post(apiUrl, {
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1,
              },
            ],
          },
        ],
      });

      const result = response.data.responses[0];

      if (!result.textAnnotations || result.textAnnotations.length === 0) {
        throw new Error('No text detected in image');
      }

      // First annotation contains full text
      const fullText = result.textAnnotations[0].description || '';

      // Simple parsing to extract potential products (this is basic and may need refinement)
      const lines = fullText.split('\n').filter(line => line.trim().length > 0);

      // Try to find price patterns (e.g., "10,000원", "1만원", etc.)
      const priceRegex = /(\d{1,3}(,\d{3})*|[0-9]+만?)원?/g;

      const products: AnalyzedProductDto[] = [];
      let currentProduct: any = {};

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const priceMatch = line.match(priceRegex);

        if (priceMatch && currentProduct.title) {
          // Found a price, complete the current product
          currentProduct.price = priceMatch[0].includes('원') ? priceMatch[0] : `${priceMatch[0]}원`;
          products.push({
            title: currentProduct.title,
            description: currentProduct.description || currentProduct.title,
            price: currentProduct.price,
            category: '기타', // Default category since Google Vision doesn't categorize
          });
          currentProduct = {};
        } else if (line.length > 2 && !priceMatch) {
          // Potential product name or description
          if (!currentProduct.title) {
            currentProduct.title = line;
          } else if (!currentProduct.description) {
            currentProduct.description = line;
          }
        }
      }

      // If no products were extracted using price matching, create one product with all text
      if (products.length === 0) {
        products.push({
          title: '전단지 텍스트 추출 완료',
          description: '아래 추출된 텍스트를 참고하여 수동으로 상품을 입력해주세요',
          price: '가격 확인 필요',
          category: '기타',
        });
      }

      const extractedText = `
=== Google Cloud Vision이 감지한 텍스트 ===

총 ${products.length}개의 상품 후보가 발견되었습니다.

${products.map((p, i) => `${i + 1}. ${p.title}
   - ${p.description}
   - 가격: ${p.price}
   - 카테고리: ${p.category}`).join('\n\n')}

📄 전체 추출 텍스트:
${fullText}
      `.trim();

      return {
        extractedText,
        products,
        imageUrl: imageUrl || `data:image/jpeg;base64,${base64Image}`,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Google Vision API Error:', error.response?.data || error.message);
        throw new Error(`Google Vision API 호출 실패: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Create multiple flyers from AI-analyzed products
   */
  async batchCreateFlyers(
    merchantId: string,
    batchDto: BatchCreateFlyerDto,
  ): Promise<{ created: Flyer[]; count: number }> {
    const createdFlyers: Flyer[] = [];

    for (const flyerData of batchDto.flyers) {
      const flyer = this.flyerRepository.create({
        merchantId,
        title: flyerData.title,
        description: flyerData.description || flyerData.title,
        category: flyerData.category as FlyerCategory,
        imageUrl: batchDto.imageUrl,
        aiProcessingStatus: 'completed',
        status: FlyerStatus.PENDING_APPROVAL,
        isActive: true,
      } as Partial<Flyer>);

      const savedFlyer = await this.flyerRepository.save(flyer);

      // Create product entry if price information is available
      if (flyerData.price) {
        const product = this.flyerProductRepository.create({
          flyerId: savedFlyer.id,
          productName: flyerData.title,
          price: flyerData.price ? parseFloat(flyerData.price.replace(/[^0-9.]/g, '')) : undefined,
          originalPrice: flyerData.originalPrice
            ? parseFloat(flyerData.originalPrice.replace(/[^0-9.]/g, ''))
            : undefined,
          promotion: flyerData.promotion,
          category: flyerData.category,
          displayOrder: 0,
        });

        await this.flyerProductRepository.save(product);
      }

      createdFlyers.push(savedFlyer);
    }

    // Emit event for batch creation
    this.eventEmitter.emit('flyers.batch.created', {
      merchantId,
      count: createdFlyers.length,
      flyerIds: createdFlyers.map(f => f.id),
      timestamp: new Date(),
    });

    return {
      created: createdFlyers,
      count: createdFlyers.length,
    };
  }

  // =====================================
  // Advertising Methods
  // =====================================

  /**
   * Update advertising settings for a flyer
   */
  async updateAdSettings(
    id: string,
    merchantId: string,
    adSettings: FlyerAdSettingsDto,
  ): Promise<Flyer> {
    const flyer = await this.flyerRepository.findOne({
      where: { id, merchantId },
    });

    if (!flyer) {
      throw new NotFoundException('Flyer not found or you do not have permission to update it');
    }

    // Update advertising settings
    Object.assign(flyer, adSettings);

    // Reset ad spent if re-enabling ads with new budget
    if (adSettings.isAdEnabled && adSettings.adBudget) {
      flyer.adSpent = 0;
    }

    return await this.flyerRepository.save(flyer);
  }

  /**
   * Track flyer ad view and charge for 5-second views
   */
  async trackFlyerAdView(
    id: string,
    viewData: TrackFlyerViewDto,
  ): Promise<{ charged: boolean; remainingBudget: number }> {
    const flyer = await this.flyerRepository.findOne({
      where: { id },
    });

    if (!flyer) {
      throw new NotFoundException('Flyer not found');
    }

    // Increment impression count
    await this.flyerRepository.increment({ id }, 'adImpressions', 1);

    // Check if this is a 5-second view and ads are enabled
    if (viewData.viewDuration >= 5 && flyer.isAdEnabled) {
      // Check if budget is available
      const remainingBudget = Number(flyer.adBudget) - Number(flyer.adSpent);

      if (remainingBudget >= Number(flyer.adCostPerView)) {
        // Charge for the view
        await this.flyerRepository.increment({ id }, 'adView5sCount', 1);
        await this.flyerRepository.increment({ id }, 'adSpent', Number(flyer.adCostPerView));

        // Update CTR
        const updatedFlyer = await this.flyerRepository.findOne({ where: { id } });
        if (updatedFlyer && updatedFlyer.adImpressions > 0) {
          updatedFlyer.adCtr = (updatedFlyer.clickCount / updatedFlyer.adImpressions) * 100;
          await this.flyerRepository.save(updatedFlyer);
        }

        return {
          charged: true,
          remainingBudget: remainingBudget - Number(flyer.adCostPerView),
        };
      } else {
        // Budget exhausted, disable ads
        flyer.isAdEnabled = false;
        await this.flyerRepository.save(flyer);

        return { charged: false, remainingBudget: 0 };
      }
    }

    return {
      charged: false,
      remainingBudget: Number(flyer.adBudget) - Number(flyer.adSpent),
    };
  }

  /**
   * Get advertising statistics for a flyer
   */
  async getAdStats(id: string, merchantId: string): Promise<FlyerAdStatsDto> {
    const flyer = await this.flyerRepository.findOne({
      where: { id, merchantId },
    });

    if (!flyer) {
      throw new NotFoundException('Flyer not found or you do not have permission to view it');
    }

    const remainingBudget = Number(flyer.adBudget || 0) - Number(flyer.adSpent || 0);
    const estimatedRemainingImpressions = flyer.adCostPerView > 0
      ? Math.floor(remainingBudget / Number(flyer.adCostPerView))
      : 0;

    return {
      adImpressions: flyer.adImpressions,
      adView5sCount: flyer.adView5sCount,
      clickCount: flyer.clickCount,
      adCtr: Number(flyer.adCtr),
      adSpent: Number(flyer.adSpent),
      remainingBudget: remainingBudget,
      estimatedRemainingImpressions,
    };
  }

  /**
   * Check if a flyer's ad budget is available
   */
  async checkBudgetAvailable(id: string): Promise<boolean> {
    const flyer = await this.flyerRepository.findOne({
      where: { id },
    });

    if (!flyer || !flyer.isAdEnabled) {
      return false;
    }

    const remainingBudget = Number(flyer.adBudget) - Number(flyer.adSpent);
    return remainingBudget >= Number(flyer.adCostPerView);
  }

  /**
   * Get flyers with active ads matching user profile
   */
  async getTargetedFlyers(
    userRegion?: string,
    userAge?: number,
    userGender?: 'male' | 'female',
    userInterests?: string[],
    limit: number = 10,
  ): Promise<Flyer[]> {
    const query = this.flyerRepository
      .createQueryBuilder('flyer')
      .leftJoinAndSelect('flyer.merchant', 'merchant')
      .where('flyer.is_active = :isActive', { isActive: true })
      .andWhere('flyer.is_ad_enabled = :isAdEnabled', { isAdEnabled: true })
      .andWhere('flyer.status = :status', { status: FlyerStatus.APPROVED })
      .andWhere('flyer.ad_spent < flyer.ad_budget'); // Only flyers with remaining budget

    // Apply targeting filters
    if (userRegion) {
      query.andWhere(
        `(flyer.target_regions IS NULL OR flyer.target_regions @> :region)`,
        { region: JSON.stringify([userRegion]) }
      );
    }

    if (userAge) {
      query.andWhere(
        `(flyer.target_age_min IS NULL OR flyer.target_age_min <= :age)`,
        { age: userAge }
      );
      query.andWhere(
        `(flyer.target_age_max IS NULL OR flyer.target_age_max >= :age)`,
        { age: userAge }
      );
    }

    if (userGender) {
      query.andWhere(
        `(flyer.target_gender = 'all' OR flyer.target_gender = :gender)`,
        { gender: userGender }
      );
    }

    if (userInterests && userInterests.length > 0) {
      query.andWhere(
        `(flyer.target_interests IS NULL OR flyer.target_interests && :interests)`,
        { interests: JSON.stringify(userInterests) }
      );
    }

    // Order by remaining budget (prioritize higher-paying ads)
    query
      .orderBy('(flyer.ad_budget - flyer.ad_spent)', 'DESC')
      .take(limit);

    return await query.getMany();
  }
}
