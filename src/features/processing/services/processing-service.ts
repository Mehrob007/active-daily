const GATEWAY_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://10.65.10.20:7575').replace(/\/$/, '');
const PROCESSING_URL = (process.env.NEXT_PUBLIC_BACKEND_PROCESSING_URL || 'http://10.64.20.84:5003').replace(/\/$/, '');
const SYSTEM_5012_URL = 'http://10.64.20.84:5012';

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

export const processingService = {
  // --- Transactions Search (Processing URL - port 5003) ---
  
  async fetchTransactions(searchType: string, params: any) {
    let url = '';
    const q = new URLSearchParams();
    
    // Aligns with fetchTransactionsByCardId
    if (searchType === 'cardId') {
      url = `${PROCESSING_URL}/api/Transactions/by-cards`;
      q.append('cardIds', params.cardId || params.cardIds);
      if (params.fromDate) q.append('fromDate', params.fromDate);
      if (params.toDate) q.append('toDate', params.toDate);
    } 
    // Aligns with fetchTransactionsByATM
    else if (searchType === 'atmId') {
      url = `${PROCESSING_URL}/api/Transactions/by-atm`;
      q.append('atmId', params.atmId);
      if (params.fromDate) q.append('fromDate', params.fromDate);
      if (params.toDate) q.append('toDate', params.toDate);
    }
    // Aligns with fetchTransactionsByUTRNNO
    else if (searchType === 'utrnno') {
      url = `${PROCESSING_URL}/api/Transactions/by-utrnno/${params.utrnno}`;
    }
    // Aligns with fetchTransactionsByType
    else if (searchType === 'transactionType') {
      url = `${PROCESSING_URL}/api/Transactions/by-transaction-type`;
      q.append('transactionType', params.transactionType);
      if (params.fromDate) q.append('fromDate', params.fromDate);
      if (params.toDate) q.append('toDate', params.toDate);
    }
    // Aligns with fetchTransactionsByAmount
    else if (searchType === 'amount') {
      url = `${PROCESSING_URL}/api/Transactions/by-amount-with-date`;
      q.append('fromAmount', params.fromAmount);
      q.append('toAmount', params.toAmount);
      if (params.fromDate) q.append('fromDate', params.fromDate);
      if (params.toDate) q.append('toDate', params.toDate);
    }
    // Aligns with fetchTransactionsByReversal
    else if (searchType === 'reversal') {
      url = `${PROCESSING_URL}/api/Transactions/by-reversal`;
      q.append('reversal', params.reversal);
      if (params.fromDate) q.append('fromDate', params.fromDate);
      if (params.toDate) q.append('toDate', params.toDate);
    }
    // Aligns with fetchTransactionsByMCC
    else if (searchType === 'mcc') {
      url = `${PROCESSING_URL}/api/Transactions/by-mcc`;
      q.append('mcc', params.mcc);
      if (params.fromDate) q.append('fromDate', params.fromDate);
      if (params.toDate) q.append('toDate', params.toDate);
    }
    // Aligns with fetchTransactionsByCardBinAndType
    else if (searchType === 'cardBinSearch') {
      url = `${PROCESSING_URL}/api/Transactions/search`;
      q.append('cardBin', params.cardBin);
      q.append('transactionType', params.transactionType);
      q.append('date', params.date);
      if (params.fromTime) q.append('fromTime', params.fromTime);
      if (params.toTime) q.append('toTime', params.toTime);
    }
    // Aligns with fetchTransactionsSearch (Universal)
    else if (searchType === 'universal') {
      url = `${PROCESSING_URL}/api/Transactions/search-transactions`;
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          q.append(key, String(value));
        }
      });
    }

    const finalUrl = q.toString() ? `${url}?${q.toString()}` : url;
    const response = await fetch(finalUrl, { headers: getHeaders() });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    return data.transactions || data;
  },

  // --- Card Management (System URL - port 5012) ---

  async fetchCardDetails(cardId: string) {
    const response = await fetch(`${SYSTEM_5012_URL}/api/Transactions/card-data`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ cardId: String(cardId) }),
    });
    return response.ok ? response.json() : null;
  },

  async fetchCardServices(cardId: string) {
    const response = await fetch(`${SYSTEM_5012_URL}/api/Transactions/services?CardId=${cardId}`, {
      headers: getHeaders(),
    });
    return response.ok ? response.json() : [];
  },

  async unblockCard(cardId: string) {
    const response = await fetch(`${SYSTEM_5012_URL}/api/Transactions/validate-card`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ cardId: String(cardId) }),
    });
    if (!response.ok) throw new Error('Failed to unblock card');
    return response.json();
  },

  async resetPinCounter(cardId: string) {
    const response = await fetch(`${SYSTEM_5012_URL}/api/Transactions/reset-pin-counter`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ cardId: String(cardId) }),
    });
    if (!response.ok) throw new Error('Failed to reset pin counter');
    return response.json();
  },

  async getLimits(cardNumber: string) {
    const response = await fetch(`${PROCESSING_URL}/api/Transactions/limits/${cardNumber}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch limits');
    return response.json();
  },

  async updateLimit(cardNumber: string, limitName: string, limitValue: string) {
    // Reference project uses GET for update!
    const q = new URLSearchParams({ limitName, limitValue });
    const response = await fetch(`${PROCESSING_URL}/api/Transactions/${cardNumber}?${q.toString()}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to update limit');
    return response.json();
  },

  async manageCardService(payload: any) {
    const response = await fetch(`${SYSTEM_5012_URL}/api/Transactions/service-action`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to manage service');
    return response.json();
  },

  // --- Gateway (Main Backend URL - port 7575) ---

  async changeCardStatus(cardId: string, status: string) {
    const response = await fetch(`${GATEWAY_URL}/api/transactions/block-card`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ cardId: String(cardId), hotCardStatus: String(status) }),
    });
    if (!response.ok) throw new Error('Failed to change card status');
    return response.json();
  },

  async generatePin(cardId: string, phoneNumber: string, pinValue = "") {
    const response = await fetch(`${GATEWAY_URL}/api/transactions/generate-pin`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ 
        cardId: String(cardId), 
        phoneNumber: String(phoneNumber), 
        pinDeliveryMethod: "WS", 
        pinValue: String(pinValue) 
      }),
    });
    if (!response.ok) throw new Error('Failed to generate pin');
    return response.json();
  },

  async sendPinOtp(phoneNumber: string) {
    const response = await fetch(`${GATEWAY_URL}/api/transactions/send-pin-otp`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ phoneNumber: String(phoneNumber) }),
    });
    if (!response.ok) throw new Error('Failed to send OTP');
    return response.json();
  },

  async checkPinOtp(phoneNumber: string, otpCode: string) {
    const response = await fetch(`${GATEWAY_URL}/api/transactions/check-pin-otp`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ phoneNumber: String(phoneNumber), otpCode: String(otpCode) }),
    });
    if (!response.ok) throw new Error('Failed to check OTP');
    return response.json();
  },

  async fetchConversionRates() {
    const response = await fetch(`${GATEWAY_URL}/api/conversion/rates`, {
      headers: getHeaders(),
    });
    if (!response.ok) return [];
    return response.json();
  }
};
