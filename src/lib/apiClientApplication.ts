import { apiClient } from '@/services/api-client';

export const applicationsApi = {
  getCards: (endpoint: string, config?: any) => {
    return apiClient.get(endpoint, { ...config, baseURL: process.env.NEXT_PUBLIC_BACKEND_APPLICATION_URL });
  },
  patchCard: (endpoint: string, data: any, config?: any) => {
    return apiClient.patch(endpoint, { ...config, body: data, baseURL: process.env.NEXT_PUBLIC_BACKEND_APPLICATION_URL });
  },
  deleteCard: (endpoint: string, config?: any) => {
    return apiClient.delete(endpoint, { ...config, baseURL: process.env.NEXT_PUBLIC_BACKEND_APPLICATION_URL });
  },
  
  getCredits: (endpoint: string, config?: any) => {
    return apiClient.get(endpoint, { ...config, baseURL: process.env.NEXT_PUBLIC_BACKEND_CREDIT_URL });
  },
  patchCredit: (endpoint: string, data: any, config?: any) => {
    return apiClient.patch(endpoint, { ...config, body: data, baseURL: process.env.NEXT_PUBLIC_BACKEND_CREDIT_URL });
  },
  deleteCredit: (endpoint: string, config?: any) => {
    return apiClient.delete(endpoint, { ...config, baseURL: process.env.NEXT_PUBLIC_BACKEND_CREDIT_URL });
  },
  
  getDeposits: (endpoint: string, config?: any) => {
    return apiClient.get(endpoint, { ...config, baseURL: process.env.NEXT_PUBLIC_BACKEND_DIPOZIT_URL });
  },
  patchDeposit: (endpoint: string, data: any, config?: any) => {
    return apiClient.patch(endpoint, { ...config, body: data, baseURL: process.env.NEXT_PUBLIC_BACKEND_DIPOZIT_URL });
  },
  deleteDeposit: (endpoint: string, config?: any) => {
    return apiClient.delete(endpoint, { ...config, baseURL: process.env.NEXT_PUBLIC_BACKEND_DIPOZIT_URL });
  }
};
