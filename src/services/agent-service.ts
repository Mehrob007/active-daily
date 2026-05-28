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

interface GetCardsParams extends QueryParams {
  page?: number;
  pageSize?: number;
  status?: string;
  type?: string;
  search?: string;
  clientId?: string;
}

interface CreateCardData {
  clientId: string;
  productId: string;
  type: 'debit' | 'credit' | 'prepaid';
  branchId: string;
  deliveryAddress?: string;
}

interface GetDepositsParams extends QueryParams {
  page?: number;
  pageSize?: number;
  status?: string;
  clientId?: string;
  currency?: string;
}

interface ApplyCreditData {
  clientId: string;
  productId: string;
  amount: number;
  term: number;
  purpose?: string;
  monthlyIncome: number;
  collateralType?: string;
}

interface GetApplicationsParams extends QueryParams {
  page?: number;
  pageSize?: number;
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

interface SendSmsData {
  recipientIds: string[];
  templateId: string;
  customMessage?: string;
  scheduledAt?: string;
}

interface SmsTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  variables: string[];
  isActive: boolean;
}

interface CashbackConfig {
  enabled: boolean;
  defaultPercent: number;
  categories: Record<string, number>;
  maxMonthlyCashback: number;
}

interface CashbackLimits {
  currentMonth: string;
  usedAmount: number;
  remainingAmount: number;
  maxAmount: number;
}

interface QrTransactionParams extends QueryParams {
  page?: number;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  merchantId?: string;
}

interface WithdrawListParams extends QueryParams {
  page?: number;
  pageSize?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const agentService = {

  async getCards(params?: GetCardsParams): Promise<ApiResponse<PaginatedResponse<CardProduct>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<CardProduct>>>('/cards/list', { params });
  },

  async createCard(data: CreateCardData): Promise<ApiResponse<Application>> {
    return apiClient.post<ApiResponse<Application>>('/cards/create', { body: data });
  },

  async getDeposits(params?: GetDepositsParams): Promise<ApiResponse<PaginatedResponse<DepositProduct>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<DepositProduct>>>('/deposits/my', { params });
  },

  async applyCredit(data: ApplyCreditData): Promise<ApiResponse<Application>> {
    return apiClient.post<ApiResponse<Application>>('/credits/apply', { body: data });
  },

  async checkCreditStatus(id: string): Promise<ApiResponse<{ status: string; details: Record<string, unknown> }>> {
    return apiClient.get<ApiResponse<{ status: string; details: Record<string, unknown> }>>(
      `/credits/status-check`,
      { params: { id } },
    );
  },

  async getApplications(params?: GetApplicationsParams): Promise<ApiResponse<PaginatedResponse<Application>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<Application>>>('/applications', { params });
  },

  async sendSms(data: SendSmsData): Promise<ApiResponse<{ sentCount: number; failedCount: number }>> {
    return apiClient.post<ApiResponse<{ sentCount: number; failedCount: number }>>('/sms/send-bulk', { body: data });
  },

  async getSmsTemplates(): Promise<ApiResponse<SmsTemplate[]>> {
    return apiClient.get<ApiResponse<SmsTemplate[]>>('/sms/templates');
  },

  async getCashbackConfig(): Promise<ApiResponse<CashbackConfig>> {
    return apiClient.get<ApiResponse<CashbackConfig>>('/cashback/config');
  },

  async updateCashbackConfig(data: Partial<CashbackConfig>): Promise<ApiResponse<CashbackConfig>> {
    return apiClient.put<ApiResponse<CashbackConfig>>('/cashback/config', { body: data });
  },

  async getCashbackLimits(): Promise<ApiResponse<CashbackLimits>> {
    return apiClient.get<ApiResponse<CashbackLimits>>('/cashback/limits/monthly');
  },

  async getQrTransactions(params?: QrTransactionParams): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<Transaction>>>('/qr/transactions', { params });
  },

  async getWithdrawList(params?: WithdrawListParams): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<Transaction>>>('/accounts/withdraw/list', { params });
  },
};
