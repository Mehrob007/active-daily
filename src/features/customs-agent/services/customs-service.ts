export interface CustomsTransaction {
  id: string | number;
  status: string;
  amount: number;
  docId: string;
  transactionId: string;
  date: string;
  type_id: string;
  emailToBeNotified: string;
  meanOfPayment: string;
  bankCode: string;
  payerINN: string;
  payerName: string;
  payerBankName: string;
  payerBankCode: string;
  payerAcc: string;
  recINN: string;
  recName: string;
  recBankName: string;
  recBankCode: string;
  recAcc: string;
  isPayed?: boolean;
  payedAt?: string;
  [key: string]: any;
}

const getBackendMain = () => {
  return process.env.NEXT_PUBLIC_BACKEND_PROCESSING_URL || '';
};

const getBackendABS = () => {
  return process.env.NEXT_PUBLIC_BACKEND_ABS_SERVICE_URL || process.env.NEXT_PUBLIC_BACKEND_PROCESSING_URL || '';
};

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getCustomsPayments = async (startDate: string, endDate: string): Promise<CustomsTransaction[]> => {
  const url = `${getBackendMain()}/eqms?start_date=${startDate}&end_date=${endDate}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) {
    throw new Error(`Ошибка HTTP ${res.status}`);
  }
  return res.json();
};

export const paySingleCustoms = async (transaction: CustomsTransaction): Promise<any> => {
  const res = await fetch(`${getBackendMain()}/eqms/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(transaction),
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(result.error || `Ошибка сервера: ${res.status}`);
  }
  if (result.error) {
    throw new Error(result.error);
  }
  return result;
};

export const exportCustomsExcel = async (transactions: CustomsTransaction[], filename: string) => {
  const res = await fetch(`${getBackendMain()}/automation/eqms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(transactions),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Ошибка выгрузки: ${res.status} - ${errorText}`);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const getAbsStatement = async (startDate: string, endDate: string, account: string): Promise<any[]> => {
  const formatDateForQuery = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return dateStr;
  };

  const sd = formatDateForQuery(startDate);
  const ed = formatDateForQuery(endDate);
  
  const url = `${getBackendABS()}/account/operations?startDate=${sd}&endDate=${ed}&accountNumber=${account}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { ...getAuthHeaders() },
  });
  
  if (!res.ok) {
    throw new Error(`Ошибка HTTP ${res.status}`);
  }
  
  return res.json();
};
