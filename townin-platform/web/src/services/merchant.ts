import api from './api';

export interface Merchant {
  id: string;
  userId: string;
  businessName: string;
  category: string;
  gridCell: string;
  address?: string;
  phone?: string;
  signboardStatus: string;
  totalFlyers: number;
  totalViews: number;
  totalClicks: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const merchantService = {
  getMyProfile: async (): Promise<Merchant> => {
    const response = await api.get('/merchants/me');
    return response.data;
  },

  updateProfile: async (data: Partial<Merchant>): Promise<Merchant> => {
    const response = await api.put('/merchants/me', data);
    return response.data;
  },
};
