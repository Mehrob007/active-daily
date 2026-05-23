const ABS_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_ABS_SERVICE_URL || 'http://localhost:5000';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://10.65.10.20:7575';
const SYSTEM_5012_URL = 'http://10.64.20.84:5012';
const API_TELEGRAM_URL = process.env.NEXT_PUBLIC_API_TELEGRAM_URL || 'http://10.64.20.84:5010'; // Hypothetical based on old project structure

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const absService = {
  async searchClients(searchType: string, query: string) {
    const response = await fetch(`${ABS_BASE_URL}/${searchType}${query}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  },

  async getAccounts(clientCode: string) {
    const response = await fetch(`${ABS_BASE_URL}/accounts?clientIndex=${clientCode}`, {
      headers: getHeaders(),
    });
    return response.ok ? response.json() : [];
  },

  async getCards(clientCode: string) {
    const response = await fetch(`${ABS_BASE_URL}/cards?clientIndex=${clientCode}`, {
      headers: getHeaders(),
    });
    return response.ok ? response.json() : [];
  },

  async getCredits(clientCode: string) {
    const response = await fetch(`${ABS_BASE_URL}/credits?clientIndex=${clientCode}`, {
      headers: getHeaders(),
    });
    return response.ok ? response.json() : [];
  },

  async getDeposits(clientCode: string) {
    const response = await fetch(`${ABS_BASE_URL}/deposits?clientIndex=${clientCode}`, {
      headers: getHeaders(),
    });
    return response.ok ? response.json() : [];
  },

  async getCardDetails(cardId: string) {
    const response = await fetch(`${ABS_BASE_URL}/api/v1/processing/card/${cardId}/details`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.ok ? response.json() : null;
  },

  async getCardServices(cardId: string) {
    const response = await fetch(`${ABS_BASE_URL}/api/v1/processing/card/${cardId}/services`, {
      headers: getHeaders()
    });
    return response.ok ? response.json() : [];
  },

  async getCardLimits(cardId: string) {
    const response = await fetch(`${ABS_BASE_URL}/api/v1/processing/card/${cardId}/limits`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch card limits');
    return response.json();
  },

  async updateCardLimits(cardId: string, limitsData: any) {
    const response = await fetch(`${ABS_BASE_URL}/api/v1/processing/card/${cardId}/limits`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(limitsData),
    });
    if (!response.ok) throw new Error('Failed to update card limits');
    return response.json();
  },

  async blockCard(cardId: string, reasonCode: string) {
    const response = await fetch(`${ABS_BASE_URL}/api/v1/processing/card/${cardId}/block`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ status: 'blocked', reason: reasonCode }),
    });
    if (!response.ok) throw new Error('Block failed');
    return response.json();
  },

  async unblockCard(cardId: string) {
    const response = await fetch(`${ABS_BASE_URL}/api/v1/processing/card/${cardId}/unblock`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Unblock failed');
    return response.json();
  },

  async resetPinCounter(cardId: string) {
    const response = await fetch(`${ABS_BASE_URL}/api/v1/processing/card/${cardId}/reset-pin-counter`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Reset PIN failed');
    return response.json();
  },

  async sendPinOtp(phoneNumber: string) {
    const response = await fetch(`${BACKEND_URL}/api/transactions/send-pin-otp`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ phoneNumber: String(phoneNumber) }),
    });
    if (!response.ok) throw new Error('OTP send failed');
    return response.json();
  },

  async verifyPinOtp(phoneNumber: string, otpCode: string) {
    const response = await fetch(`${BACKEND_URL}/api/transactions/check-pin-otp`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ phoneNumber: String(phoneNumber), otpCode: String(otpCode) }),
    });
    if (!response.ok) throw new Error('OTP verification failed');
    return response.json();
  },

  async generatePin(cardId: string, phoneNumber: string, pinValue: string = '') {
    const response = await fetch(`${BACKEND_URL}/api/transactions/generate-pin`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        cardId: String(cardId),
        phoneNumber: String(phoneNumber),
        pinDeliveryMethod: 'WS',
        pinValue: String(pinValue),
      }),
    });
    if (!response.ok) throw new Error('PIN generation failed');
    return response.json();
  },

  async executeServiceAction(action: any) {
    const response = await fetch(`${ABS_BASE_URL}/api/v1/processing/card/${action.cardId || 'unknown'}/services/manage`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(action),
    });
    if (!response.ok) throw new Error('Service action failed');
    return response.json();
  },

  // Missing features from old project
  async getTelegramUser(phone: string) {
    const response = await fetch(`${API_TELEGRAM_URL}/api/Users/get-users-by-phone?phone=${phone}`);
    if (!response.ok) return null;
    const json = await response.json();
    return Array.isArray(json?.data) && json.data.length > 0 ? json.data[0] : null;
  },

  async deleteTelegramId(phone: string) {
    const response = await fetch(`${API_TELEGRAM_URL}/api/Users/telegramId?phone=${phone}`, {
      method: 'PUT',
    });
    if (!response.ok) throw new Error('Telegram delete failed');
    return response.json();
  },

  async getCreditGraphs(referenceId: string) {
    const response = await fetch(`${ABS_BASE_URL}/credits/graphs?referenceId=${referenceId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Credit graphs failed');
    return response.json();
  },

  async getLoanDetails(referenceId: string) {
    // This might need a different base URL or endpoint in the new backend
    const response = await fetch(`${BACKEND_URL}/api/abs/loan-details?referenceId=${referenceId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Loan details failed');
    return response.json();
  },

  async repayLoan(repayData: any) {
    const response = await fetch(`${BACKEND_URL}/api/abs/repay-loan`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(repayData),
    });
    if (!response.ok) throw new Error('Repay failed');
    return response.json();
  },

  async getClientDocumentsByINN(inn: string) {
    const response = await fetch(`${BACKEND_URL}/api/client/documents-by-inn?inn=${inn}`, {
      headers: getHeaders(),
    });
    if (!response.ok) return [];
    return response.json();
  }
};
