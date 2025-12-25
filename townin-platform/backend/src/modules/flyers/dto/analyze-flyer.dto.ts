import { IsString, IsOptional } from 'class-validator';

export class AnalyzeFlyerDto {
  @IsString()
  @IsOptional()
  imageUrl?: string;

  // File will be uploaded via multipart/form-data
  // file?: Express.Multer.File;
}

export class AnalyzedProductDto {
  title: string;
  description: string;
  category: string;
  price?: string;
  originalPrice?: string;
  promotion?: string;
}

export class AnalyzeFlyerResponseDto {
  extractedText: string;
  products: AnalyzedProductDto[];
  imageUrl?: string;
}
