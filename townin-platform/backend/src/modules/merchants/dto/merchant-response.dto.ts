import { MerchantStatus } from '../merchant.entity';

export class MerchantResponseDto {
  id: string;
  userId: string;
  businessName: string;
  businessNumber: string | null;
  phone: string | null;
  category: string;
  gridCell: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  openingHours: Record<string, any> | null;
  logoFileId: string | null;
  status: MerchantStatus;
  rejectionReason: string | null;
  signboardStatus: string;
  totalFlyers: number;
  totalViews: number;
  totalClicks: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  approvedAt: Date | null;
}
