import api from './api';

export interface Flyer {
  id: string;
  merchantId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  category: string;
  gridCell: string;
  targetRegions?: string[];
  viewCount: number;
  clickCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlyerData {
  title: string;
  description?: string;
  category: string;
  gridCell: string;
  targetRegions?: string[];
  expiresAt?: string;
}

export interface AnalyzedProduct {
  title: string;
  description: string;
  category: string;
  price?: string;
  originalPrice?: string;
  promotion?: string;
}

export interface AnalyzeResponse {
  success: boolean;
  message: string;
  data: {
    extractedText: string;
    products: AnalyzedProduct[];
    imageUrl?: string;
  };
}

export interface BatchFlyerItem {
  title: string;
  description?: string;
  category: string;
  price?: string;
  originalPrice?: string;
  promotion?: string;
}

export interface BatchCreateData {
  gridCell: string;
  imageUrl?: string;
  flyers: BatchFlyerItem[];
}

export interface BatchCreateResponse {
  success: boolean;
  message: string;
  data: {
    created: Flyer[];
    count: number;
  };
}

export const flyerService = {
  getMyFlyers: async (): Promise<Flyer[]> => {
    const response = await api.get('/flyers');
    return response.data;
  },

  createFlyer: async (data: CreateFlyerData): Promise<Flyer> => {
    const response = await api.post('/flyers', data);
    return response.data;
  },

  updateFlyer: async (id: string, data: Partial<CreateFlyerData>): Promise<Flyer> => {
    const response = await api.put(`/flyers/${id}`, data);
    return response.data;
  },

  deleteFlyer: async (id: string): Promise<void> => {
    await api.delete(`/flyers/${id}`);
  },

  uploadImage: async (id: string, file: File): Promise<Flyer> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post(`/flyers/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // AI OCR Analysis
  analyzeFlyerImage: async (file: File): Promise<AnalyzeResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/flyers/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Batch Create Flyers
  batchCreateFlyers: async (data: BatchCreateData): Promise<BatchCreateResponse> => {
    const response = await api.post('/flyers/batch', data);
    return response.data;
  },
};
