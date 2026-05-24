import { apiClient } from '@/services/api-client';

export interface CardSales {
  cards_prem: number;
  cards_sailed: number;
  cards_sailed_in_general: number;
  deb_osd: number;
  out_balance: number;
}

export interface CardTurnover {
  card_turnovers_prem: number;
  active_cards_perms: number;
}

export interface ServiceQuality {
  call_center: number;
  complaint: number;
  tests: number;
}

export interface MobileBank {
  mobile_bank_connects: number;
}

export interface WorkerUser {
  ID: number | string;
  full_name: string;
  username: string;
}

export interface Worker {
  ID: number;
  salary: number;
  plan: number;
  salary_project: number;
  position?: string;
  place_work?: string;
  CardSales: CardSales[];
  CardTurnovers: CardTurnover[];
  ServiceQuality: ServiceQuality[];
  MobileBank: MobileBank[];
  user: WorkerUser;
  totalPremia?: number; // Enhanced value
}

export const operatorPremieService = {
  async fetchWorkers(month: number, year: number, after?: number | null): Promise<Worker[]> {
    const params: any = {
      month,
      year,
      loadCardTurnovers: 'true',
      loadCardSales: 'true',
      loadCardDetails: 'false',
      loadUser: 'true',
      loadServiceQuality: 'true',
      loadMobileBank: 'true',
    };
    if (after !== undefined && after !== null) {
      params.after = after;
    }

    const response = await apiClient.get<{ workers: Worker[] }>('/workers', { params });
    return Array.isArray(response.workers) ? response.workers : [];
  },

  async updateWorker(id: number, data: Partial<Worker>): Promise<void> {
    const payload = {
      salary: parseFloat(String(data.salary)) || 0,
      position: data.position || "",
      place_work: data.place_work || "",
      user: {
        full_name: data.user?.full_name || "",
        username: data.user?.username || "",
      },
    };
    await apiClient.patch(`/workers/user/${id}`, { body: payload });
  },

  async downloadReport(workerId: number, month: number, year: number): Promise<Blob> {
    const url = `/automation/reports/${workerId}?month=${month}&year=${year}`;
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://10.65.10.20:7575'}${url}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to download report');
    return response.blob();
  }
};
