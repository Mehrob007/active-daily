const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://10.65.10.20:7575';

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const processingService = {
  async changeCardLimit(payload: any) {
    const response = await fetch(`${BACKEND_URL}/api/transactions/change-limit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Ошибка при изменении лимита' }));
      throw new Error(error.message || 'Ошибка при изменении лимита');
    }
    return response.json();
  },

  async fetchTransactions(searchType: string, params: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${BACKEND_URL}/api/transactions/search/${searchType}?${query}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  async fetchConversionRates() {
    const response = await fetch(`${BACKEND_URL}/api/conversion/rates`, {
      headers: getHeaders(),
    });
    if (!response.ok) return [];
    return response.json();
  }
};
