import { apiClient, type QueryParams } from '@/services/api-client';
import type {
  ApiResponse,
  PaginatedResponse,
  PremieRecord,
} from '@/types';

// ============================================
// Back-Office Service — Operator & Worker API
// ============================================

/** Parameters for calculating premies (bonuses) */
interface CalculatePremiesParams extends QueryParams {
  period: string;
  departmentId?: string;
  employeeId?: string;
  includeDetails?: boolean;
}

/** Report generation parameters */
interface ReportParams extends QueryParams {
  dateFrom: string;
  dateTo: string;
  format?: 'pdf' | 'xlsx' | 'csv';
  departmentId?: string;
  employeeId?: string;
}

/** Report type for generation */
type ReportType = 'premies' | 'applications' | 'transactions' | 'kpi';

/** Active test for workers */
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

/** Test answer submission */
interface TestAnswer {
  questionId: string;
  answerId: string;
}

/** Test submission result */
interface TestResult {
  testId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  completedAt: string;
}

/** Data log entry */
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

/** Parameters for data logs */
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
  /**
   * Calculate premies (bonus payments) for a given period.
   * Returns a list of calculated bonus records.
   */
  async calculatePremies(params: CalculatePremiesParams): Promise<ApiResponse<PremieRecord[]>> {
    return apiClient.get<ApiResponse<PremieRecord[]>>('/operator/premies/calculate', { params });
  },

  /**
   * Generate a report of the specified type.
   * Returns a blob URL for downloading the generated file.
   */
  async generateReport(
    type: ReportType,
    params: ReportParams,
  ): Promise<ApiResponse<{ downloadUrl: string; filename: string }>> {
    return apiClient.post<ApiResponse<{ downloadUrl: string; filename: string }>>(
      `/reports/generate/${type}`,
      { body: params },
    );
  },

  /**
   * Get list of active tests available for workers.
   */
  async getActiveTests(): Promise<ApiResponse<ActiveTest[]>> {
    return apiClient.get<ApiResponse<ActiveTest[]>>('/worker/tests/active');
  },

  /**
   * Submit answers for a specific test.
   */
  async submitTestAnswers(
    testId: string,
    answers: TestAnswer[],
  ): Promise<ApiResponse<TestResult>> {
    return apiClient.post<ApiResponse<TestResult>>(`/worker/tests/submit`, {
      body: { testId, answers },
    });
  },

  /**
   * Get data audit logs with filtering and pagination.
   * Used by operators to track changes in the system.
   */
  async getDataLogs(params?: DataLogParams): Promise<ApiResponse<PaginatedResponse<DataLogEntry>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<DataLogEntry>>>('/operator/data/logs', { params });
  },
};
