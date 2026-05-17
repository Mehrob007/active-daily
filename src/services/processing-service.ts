import { apiClient, type QueryParams } from '@/services/api-client';
import type {
  ApiResponse,
  Client,
  PaginatedResponse,
  Transaction,
} from '@/types';

// ============================================
// Processing Service — Technical / ABS API
// ============================================

/** Parameters for searching a client in the ABS */
interface SearchClientParams extends QueryParams {
  query: string;
  searchBy?: 'passport' | 'phone' | 'account' | 'name';
}

/** Client search result from ABS */
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

/** Request body for updating client limits */
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

/** Response shape for limit update */
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

/** Parameters for universal transaction search */
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

/** Client document */
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
  /**
   * Search for a client in the core banking system (ABS).
   * Supports search by passport, phone, account number, or name.
   */
  async searchClient(params: SearchClientParams): Promise<ApiResponse<ClientSearchResult[]>> {
    return apiClient.get<ApiResponse<ClientSearchResult[]>>('/abs/search/client', { params });
  },

  /**
   * Update client account limits (POST — full replacement).
   */
  async updateLimits(data: UpdateLimitsData): Promise<ApiResponse<LimitsUpdateResponse>> {
    return apiClient.post<ApiResponse<LimitsUpdateResponse>>('/processing/limits/update', { body: data });
  },

  /**
   * Partially update client account limits (PATCH — merge).
   */
  async patchLimits(data: Partial<UpdateLimitsData>): Promise<ApiResponse<LimitsUpdateResponse>> {
    return apiClient.patch<ApiResponse<LimitsUpdateResponse>>('/processing/limits/update', { body: data });
  },

  /**
   * Universal transaction search across all accounts.
   * Supports advanced filtering by client, amount, date, type, and status.
   */
  async universalTransactionSearch(
    params?: UniversalTransactionSearchParams,
  ): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<Transaction>>>(
      '/processing/transactions/universal',
      { params },
    );
  },

  /**
   * Get all documents associated with a specific client.
   */
  async getClientDocuments(clientId: string): Promise<ApiResponse<ClientDocument[]>> {
    return apiClient.get<ApiResponse<ClientDocument[]>>(`/client/documents/${clientId}`);
  },
};
