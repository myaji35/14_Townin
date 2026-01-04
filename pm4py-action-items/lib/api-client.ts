// API Client for Townin Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface ApiResponse<T> {
    data: T;
    message?: string;
    statusCode: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface Flyer {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    discount?: string;
    category: string;
    merchantId: string;
    merchantName?: string;
    storeName?: string;
    location: string;
    latitude?: number;
    longitude?: number;
    validFrom: string;
    validUntil: string;
    points: number;
    status: 'pending' | 'approved' | 'rejected';
    views: number;
    clicks: number;
    createdAt: string;
    updatedAt: string;
}

export interface Merchant {
    id: string;
    userId: string;
    businessName: string;
    businessRegistrationNumber: string;
    category: string;
    address: string;
    phoneNumber: string;
    email: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export interface ApprovalRequest {
    flyerId: string;
    status: 'approved' | 'rejected';
    reason?: string;
    guardId: string;
}

class ApiClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;

        // Load token from localStorage if available
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('auth_token');
        }
    }

    setToken(token: string) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
        }
    }

    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth APIs
    async login(email: string, password: string) {
        return this.request<{ access_token: string; user: any }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async register(userData: {
        email: string;
        password: string;
        name: string;
        phoneNumber: string;
    }) {
        return this.request<any>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    // Flyer APIs
    async getFlyers(params?: {
        page?: number;
        limit?: number;
        status?: string;
        merchantId?: string;
    }) {
        const query = new URLSearchParams(params as any).toString();
        return this.request<PaginatedResponse<Flyer>>(`/flyers?${query}`);
    }

    async getFlyer(id: string) {
        return this.request<Flyer>(`/flyers/${id}`);
    }

    async createFlyer(data: Partial<Flyer>) {
        return this.request<Flyer>('/flyers', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateFlyer(id: string, data: Partial<Flyer>) {
        return this.request<Flyer>(`/flyers/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteFlyer(id: string) {
        return this.request<void>(`/flyers/${id}`, {
            method: 'DELETE',
        });
    }

    // Merchant APIs
    async getMerchants(params?: { page?: number; limit?: number }) {
        const query = new URLSearchParams(params as any).toString();
        return this.request<PaginatedResponse<Merchant>>(`/merchants?${query}`);
    }

    async getMerchant(id: string) {
        return this.request<Merchant>(`/merchants/${id}`);
    }

    async createMerchant(data: Partial<Merchant>) {
        return this.request<Merchant>('/merchants', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Approval APIs (Security Guard)
    async getPendingFlyers() {
        return this.request<PaginatedResponse<Flyer>>('/flyers?status=pending');
    }

    async approveFlyer(data: ApprovalRequest) {
        return this.request<Flyer>(`/flyers/${data.flyerId}/approve`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async rejectFlyer(data: ApprovalRequest) {
        return this.request<Flyer>(`/flyers/${data.flyerId}/reject`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Analytics APIs
    async getFlyerAnalytics(flyerId: string) {
        return this.request<{
            views: number;
            clicks: number;
            conversion: number;
            dailyStats: Array<{ date: string; views: number; clicks: number }>;
        }>(`/analytics/flyers/${flyerId}`);
    }

    async getMerchantAnalytics(merchantId: string) {
        return this.request<{
            totalFlyers: number;
            totalViews: number;
            totalClicks: number;
            avgConversion: number;
            revenue: number;
            topFlyers: Flyer[];
        }>(`/analytics/merchants/${merchantId}`);
    }

    // Public Data APIs
    async getCCTVData(params?: { region?: string; limit?: number }) {
        const query = new URLSearchParams(params as any).toString();
        return this.request<any>(`/public-data/cctv?${query}`);
    }

    async getParkingData(params?: { region?: string; limit?: number }) {
        const query = new URLSearchParams(params as any).toString();
        return this.request<any>(`/public-data/parking?${query}`);
    }
}

export const apiClient = new ApiClient();

export default apiClient;
