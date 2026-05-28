import { apiClient } from '@/services/api-client';

export interface WorkerPremieData {
  ID: number;
  salary: number;
  plan: number;
  salary_project: number;
  CardTurnovers: {
    card_turnovers_prem: number;
    active_cards_perms: number;
  }[];
  CardSales: {
    cards_prem: number;
  }[];
  ServiceQuality: {
    call_center: number;
    complaint: number;
    tests: number;
  }[];
  MobileBank: {
    mobile_bank_connects: number;
  }[];
  user: {
    full_name: string;
    username: string;
  };
}

export const workerPremieService = {
  async fetchWorkerData(month: number, year: number): Promise<WorkerPremieData> {
    const params = {
      month,
      year,
      loadCardTurnovers: 'true',
      loadCardSales: 'true',
      loadCardDetails: 'false',
      loadUser: 'true',
      loadServiceQuality: 'true',
      loadMobileBank: 'true',
    };

    return apiClient.get<WorkerPremieData>('/worker', { params });
  }
};
