const QR_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_QR_URL || 'http://10.65.1.10:8080').replace(/\/$/, '');
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://10.65.10.20:7575').replace(/\/$/, '');
const ABS_SERVICE_URL = (process.env.NEXT_PUBLIC_BACKEND_ABS_SERVICE_URL || 'http://localhost:5000').replace(/\/$/, '');

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const qrAgentService = {
  async getLimit() {
    const response = await fetch(`${QR_BASE_URL}/limit`);
    if (!response.ok) throw new Error('Failed to fetch limit');
    return response.json();
  },

  async getTransactions(type: 'usOnThem' | 'themOnUs', startDate: string, endDate: string, page: number, limit: number) {
    const endpoint = type === 'usOnThem' ? 'transactions' : 'incoming_tx';
    const response = await fetch(`${QR_BASE_URL}/${endpoint}?start_date=${startDate}&end_date=${endDate}&page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  async getBanks() {
    // В референсном проекте этот URL указан как верный для базы банков
    const response = await fetch(`http://10.64.20.101:8080/banks`);
    if (!response.ok) throw new Error('Failed to fetch banks');
    return response.json();
  },

  async getMerchants() {
    const response = await fetch(`${BACKEND_URL}/merchants`);
    if (!response.ok) throw new Error('Failed to fetch merchants');
    return response.json();
  },

  async getWithdrawOperations(startDate: string, endDate: string, accountNumber: string) {
    const response = await fetch(`${ABS_SERVICE_URL}/abs-withdraw/operations?start_date=${startDate}&end_date=${endDate}&accountNumber=${accountNumber}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch operations');
    return response.json();
  },

  async payOperation(row: any) {
    const params = new URLSearchParams({
      date: row.doper || '',
      execdt: row.EXECDT || '',
      txtdscr: row.TXTDSCR || '',
      txnumdoc: row.NUMDOC || '',
    });
    const response = await fetch(`${ABS_SERVICE_URL}/abs-withdraw/transactions/pay?${params.toString()}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ payer_iban: row.account }),
    });
    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      throw new Error(json.error || `Server error: ${response.status}`);
    }
    return response.json();
  },

  async getWithdrawSettings() {
    const response = await fetch(`${ABS_SERVICE_URL}/abs-withdraw`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  },

  async createWithdrawSetting(data: any) {
    const response = await fetch(`${ABS_SERVICE_URL}/abs-withdraw`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create setting');
    return response.json();
  },

  async updateWithdrawSetting(id: number, data: any) {
    const response = await fetch(`${ABS_SERVICE_URL}/abs-withdraw/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update setting');
    return response.json();
  },

  async deleteWithdrawSetting(id: number) {
    const response = await fetch(`${ABS_SERVICE_URL}/abs-withdraw/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete setting');
    return response.json();
  },

  async exportTransactions(type: 'usOnThem' | 'themOnUs', data: any[]) {
    const route = type === 'usOnThem' ? '/automation/qr/us-on-them' : '/automation/qr/them-on-us';
    const response = await fetch(`${BACKEND_URL}${route}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  }
};
