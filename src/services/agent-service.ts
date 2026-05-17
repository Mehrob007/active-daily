import { apiClient, type QueryParams } from '@/services/api-client';
import type {
  ApiResponse,
  Application,
  CardProduct,
  CreditProduct,
  DepositProduct,
  PaginatedResponse,
  Transaction,
} from '@/types';

// ============================================
// Agent Service — Agent Operations API
// ============================================

/** Parameters for listing cards */
interface GetCardsParams extends QueryParams {
  page?: number;
  pageSize?: number;
  status?: string;
  type?: string;
  search?: string;
  clientId?: string;
}

/** Request body for creating a new card */
interface CreateCardData {
  clientId: string;
  productId: string;
  type: 'debit' | 'credit' | 'prepaid';
  branchId: string;
  deliveryAddress?: string;
}

/** Parameters for listing deposits */
interface GetDepositsParams extends QueryParams {
  page?: number;
  pageSize?: number;
  status?: string;
  clientId?: string;
  currency?: string;
}

/** Request body for applying for credit */
interface ApplyCreditData {
  clientId: string;
  productId: string;
  amount: number;
  term: number;
  purpose?: string;
  monthlyIncome: number;
  collateralType?: string;
}

/** Parameters for listing applications */
interface GetApplicationsParams extends QueryParams {
  page?: number;
  pageSize?: number;
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

/** Request body for sending bulk SMS */
interface SendSmsData {
  recipientIds: string[];
  templateId: string;
  customMessage?: string;
  scheduledAt?: string;
}

/** SMS template shape */
interface SmsTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  variables: string[];
  isActive: boolean;
}

/** Cashback configuration */
interface CashbackConfig {
  enabled: boolean;
  defaultPercent: number;
  categories: Record<string, number>;
  maxMonthlyCashback: number;
}

/** Cashback monthly limits */
interface CashbackLimits {
  currentMonth: string;
  usedAmount: number;
  remainingAmount: number;
  maxAmount: number;
}

/** Parameters for QR transaction list */
interface QrTransactionParams extends QueryParams {
  page?: number;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  merchantId?: string;
}

/** Parameters for withdraw list */
interface WithdrawListParams extends QueryParams {
  page?: number;
  pageSize?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const agentService = {
  /**
   * Get list of cards with optional filtering and pagination.
   */
  async getCards(params?: GetCardsParams): Promise<ApiResponse<PaginatedResponse<CardProduct>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<CardProduct>>>('/cards/list', { params });
  },

  /**
   * Create a new card application.
   */
  async createCard(data: CreateCardData): Promise<ApiResponse<Application>> {
    return apiClient.post<ApiResponse<Application>>('/cards/create', { body: data });
  },

  /**
   * Get list of deposits for the current agent.
   */
  async getDeposits(params?: GetDepositsParams): Promise<ApiResponse<PaginatedResponse<DepositProduct>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<DepositProduct>>>('/deposits/my', { params });
  },

  /**
   * Apply for a credit product on behalf of a client.
   */
  async applyCredit(data: ApplyCreditData): Promise<ApiResponse<Application>> {
    return apiClient.post<ApiResponse<Application>>('/credits/apply', { body: data });
  },

  /**
   * Check the status of a credit application by its ID.
   */
  async checkCreditStatus(id: string): Promise<ApiResponse<{ status: string; details: Record<string, unknown> }>> {
    return apiClient.get<ApiResponse<{ status: string; details: Record<string, unknown> }>>(
      `/credits/status-check`,
      { params: { id } },
    );
  },

  /**
   * Get list of applications with pagination and filtering.
   */
  async getApplications(params?: GetApplicationsParams): Promise<ApiResponse<PaginatedResponse<Application>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<Application>>>('/applications', { params });
  },

  /**
   * Send bulk SMS messages to recipients.
   */
  async sendSms(data: SendSmsData): Promise<ApiResponse<{ sentCount: number; failedCount: number }>> {
    return apiClient.post<ApiResponse<{ sentCount: number; failedCount: number }>>('/sms/send-bulk', { body: data });
  },

  /**
   * Get available SMS templates.
   */
  async getSmsTemplates(): Promise<ApiResponse<SmsTemplate[]>> {
    return apiClient.get<ApiResponse<SmsTemplate[]>>('/sms/templates');
  },

  /**
   * Get current cashback configuration.
   */
  async getCashbackConfig(): Promise<ApiResponse<CashbackConfig>> {
    return apiClient.get<ApiResponse<CashbackConfig>>('/cashback/config');
  },

  /**
   * Update cashback configuration.
   */
  async updateCashbackConfig(data: Partial<CashbackConfig>): Promise<ApiResponse<CashbackConfig>> {
    return apiClient.put<ApiResponse<CashbackConfig>>('/cashback/config', { body: data });
  },

  /**
   * Get monthly cashback usage limits.
   */
  async getCashbackLimits(): Promise<ApiResponse<CashbackLimits>> {
    return apiClient.get<ApiResponse<CashbackLimits>>('/cashback/limits/monthly');
  },

  /**
   * Get QR transaction history with filtering.
   */
  async getQrTransactions(params?: QrTransactionParams): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<Transaction>>>('/qr/transactions', { params });
  },

  /**
   * Get withdraw/cash-out request list.
   */
  async getWithdrawList(params?: WithdrawListParams): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<Transaction>>>('/accounts/withdraw/list', { params });
  },
};
