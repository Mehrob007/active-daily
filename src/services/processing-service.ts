import { apiClient, type QueryParams } from '@/services/api-client';
import type {
  ApiResponse,
  Client,
  PaginatedResponse,
  Transaction,
} from '@/types';

interface SearchClientParams extends QueryParams {
  query: string;
  searchBy?: 'passport' | 'phone' | 'account' | 'name';
}

interface ClientSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  passport: string;
  phone: string;
  birthDate?: string;
  status: 'active' | 'blocked' | 'closed';
  accounts: {
    id: string;
    number: string;
    type: string;
    balance: number;
    currency: string;
  }[];
}

interface UpdateLimitsData {
  clientId: string;
  accountId: string;
  limits: {
    dailyTransfer: number;
    monthlyTransfer: number;
    dailyWithdrawal: number;
    monthlyWithdrawal: number;
  };
  reason: string;
}

interface LimitsUpdateResponse {
  clientId: string;
  accountId: string;
  updatedLimits: {
    dailyTransfer: number;
    monthlyTransfer: number;
    dailyWithdrawal: number;
    monthlyWithdrawal: number;
  };
  updatedAt: string;
  updatedBy: string;
}

interface UniversalTransactionSearchParams extends QueryParams {
  page?: number;
  pageSize?: number;
  clientId?: string;
  accountNumber?: string;
  dateFrom?: string;
  dateTo?: string;
  amountFrom?: number;
  amountTo?: number;
  type?: string;
  status?: string;
  transactionId?: string;
}

interface ClientDocument {
  id: string;
  clientId: string;
  type: string;
  name: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  category: 'passport' | 'contract' | 'application' | 'statement' | 'other';
}

export const processingService = {

  async searchClient(params: SearchClientParams): Promise<ApiResponse<ClientSearchResult[]>> {
    return apiClient.get<ApiResponse<ClientSearchResult[]>>('/abs/search/client', { params });
  },

  async updateLimits(data: UpdateLimitsData): Promise<ApiResponse<LimitsUpdateResponse>> {
    return apiClient.post<ApiResponse<LimitsUpdateResponse>>('/processing/limits/update', { body: data });
  },

  async patchLimits(data: Partial<UpdateLimitsData>): Promise<ApiResponse<LimitsUpdateResponse>> {
    return apiClient.patch<ApiResponse<LimitsUpdateResponse>>('/processing/limits/update', { body: data });
  },

  async universalTransactionSearch(
    params?: UniversalTransactionSearchParams,
  ): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<Transaction>>>(
      '/processing/transactions/universal',
      { params },
    );
  },

  async getClientDocuments(clientId: string): Promise<ApiResponse<ClientDocument[]>> {
    return apiClient.get<ApiResponse<ClientDocument[]>>(`/client/documents/${clientId}`);
  },
};
