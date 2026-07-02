import { apiClient } from '@/services/api-client';

const BACKEND_ABS_URL = (process.env.NEXT_PUBLIC_BACKEND_ABS_SERVICE_URL || 'http://localhost:5000').replace(/\/$/, '');
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

export interface OperationTransaction {
  DOCDOPER?: string;
  EXECDT?: string;
  TXTDSCR?: string;
  MOVD?: string;
  MOVC?: string;
  CLIENTCOR?: string;
  ACCCOR?: string;
  NAMEBCR?: string;
  MOVDN?: string;
  MOVCN?: string;
  doper?: string;
  kurs?: string;
  sumBalOut?: string;
  sumMovD?: string;
  sumMovC?: string;
  sumMovDN?: string;
  sumMovCN?: string;
  transactionsCount?: number;
  [key: string]: any;
}

export const fetchAccountOperations = async (
  accountNumber: string,
  startDate?: string,
  endDate?: string
): Promise<OperationTransaction[]> => {
  if (!accountNumber) throw new Error("Номер счета обязателен");

  const params = new URLSearchParams();
  
  const formatToDDMMYYYY = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}.${m}.${y}`;
  };

  if (startDate) params.append("startDate", formatToDDMMYYYY(startDate));
  if (endDate) params.append("endDate", formatToDDMMYYYY(endDate));
  params.append("accountNumber", accountNumber);

  const url = `${BACKEND_ABS_URL}/account/operations?${params.toString()}`;
  
  const response = await apiClient.get<any[]>(url, { baseURL: '' });
  
  if (response && Array.isArray(response)) {
    return response.flatMap((day) =>
      (day.Transactions || []).map((tx: any) => ({
        ...tx,
        doper: day.DOPER,
        kurs: day.Kurs,
        sumBalOut: day.SumBalOut,
        sumMovD: day.SumMovD,
        sumMovC: day.SumMovC,
        sumMovDN: day.SumMovDN,
        sumMovCN: day.SumMovCN,
        transactionsCount: day.TransactionsCount,
      }))
    );
  }
  
  return [];
};

export const sendExportOtp = async (account: string): Promise<any> => {
  const url = `${BACKEND_URL}/otp/send`;
  return await apiClient.post(url, { account }, { baseURL: '' });
};

export const verifyExportOtp = async (account: string, otp_code: string): Promise<any> => {
  const url = `${BACKEND_URL}/otp/check`;
  const response = await apiClient.post<any>(url, { account, otp_code }, { baseURL: '' });
  
  if (response?.message === false) {
    throw new Error("Неверный код подтверждения");
  }
  
  return response;
};
