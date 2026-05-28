import { apiClient, type QueryParams } from '@/services/api-client';
import type {
  ApiResponse,
  DailyTaskStats,
  KPIData,
  PaginatedResponse,
  SystemLog,
} from '@/types';

interface SummaryReportParams extends QueryParams {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  date?: string;
  departmentId?: string;
  includeComparison?: boolean;
}

interface SummaryReport {
  period: string;
  dateFrom: string;
  dateTo: string;
  kpi: KPIData;
  applicationBreakdown: {
    cards: number;
    credits: number;
    deposits: number;
  };
  revenueBreakdown: {
    fees: number;
    interest: number;
    cashback: number;
    other: number;
  };
  comparisonWithPrevious?: {
    totalApplications: number;
    totalRevenue: number;
    newClients: number;
  };
}

interface SystemLogParams extends QueryParams {
  page?: number;
  pageSize?: number;
  userId?: string;
  action?: string;
  resource?: string;
  dateFrom?: string;
  dateTo?: string;
  level?: 'info' | 'warning' | 'error' | 'critical';
}

interface DailyTaskStatus {
  taskId: string;
  taskName: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending' | 'overdue' | 'failed';
  assignee?: string;
  completedAt?: string;
  dueDate: string;
  stats: DailyTaskStats;
}

export const analyticsService = {

  async getSummaryReport(params: SummaryReportParams): Promise<ApiResponse<SummaryReport>> {
    return apiClient.get<ApiResponse<SummaryReport>>('/analytics/reports/summary', { params });
  },

  async getSystemLogs(params?: SystemLogParams): Promise<ApiResponse<PaginatedResponse<SystemLog>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<SystemLog>>>('/admin/system/logs', { params });
  },

  async getDailyTasksStatus(): Promise<ApiResponse<DailyTaskStatus[]>> {
    return apiClient.get<ApiResponse<DailyTaskStatus[]>>('/admin/tasks/status');
  },
};
