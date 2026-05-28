import { apiClient, type QueryParams } from '@/services/api-client';
import type {
  ApiResponse,
  PaginatedResponse,
  PremieRecord,
} from '@/types';

interface CalculatePremiesParams extends QueryParams {
  period: string;
  departmentId?: string;
  employeeId?: string;
  includeDetails?: boolean;
}

interface ReportParams extends QueryParams {
  dateFrom: string;
  dateTo: string;
  format?: 'pdf' | 'xlsx' | 'csv';
  departmentId?: string;
  employeeId?: string;
}

type ReportType = 'premies' | 'applications' | 'transactions' | 'kpi';

interface ActiveTest {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  timeLimitMinutes: number;
  category: string;
  startedAt?: string;
  completedAt?: string;
}

interface TestAnswer {
  questionId: string;
  answerId: string;
}

interface TestResult {
  testId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  completedAt: string;
}

interface DataLogEntry {
  id: string;
  action: string;
  userId: string;
  userName: string;
  entityType: string;
  entityId: string;
  changes: Record<string, { before: unknown; after: unknown }>;
  timestamp: string;
}

interface DataLogParams extends QueryParams {
  page?: number;
  pageSize?: number;
  action?: string;
  entityType?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const backOfficeService = {

  async calculatePremies(params: CalculatePremiesParams): Promise<ApiResponse<PremieRecord[]>> {
    return apiClient.get<ApiResponse<PremieRecord[]>>('/operator/premies/calculate', { params });
  },

  async generateReport(
    type: ReportType,
    params: ReportParams,
  ): Promise<ApiResponse<{ downloadUrl: string; filename: string }>> {
    return apiClient.post<ApiResponse<{ downloadUrl: string; filename: string }>>(
      `/reports/generate/${type}`,
      { body: params },
    );
  },

  async getActiveTests(): Promise<ApiResponse<ActiveTest[]>> {
    return apiClient.get<ApiResponse<ActiveTest[]>>('/worker/tests/active');
  },

  async submitTestAnswers(
    testId: string,
    answers: TestAnswer[],
  ): Promise<ApiResponse<TestResult>> {
    return apiClient.post<ApiResponse<TestResult>>(`/worker/tests/submit`, {
      body: { testId, answers },
    });
  },

  async getDataLogs(params?: DataLogParams): Promise<ApiResponse<PaginatedResponse<DataLogEntry>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<DataLogEntry>>>('/operator/data/logs', { params });
  },
};
