export interface PVNTransaction {
  id: number;
  cardNumber?: string;
  amount?: number;
  currency?: number;
  localTransactionDate?: string;
  localTransactionTime?: string;
  terminalId?: string;
  atmId?: string;
  utrnno?: string;
  transaction_card_payed?: {
    is_payed?: boolean;
    isPayed?: boolean;
    createdAt?: string;
  };
  [key: string]: any;
}

export const getPVNTransactions = async (from: string, to: string): Promise<PVNTransaction[]> => {
  const backendABS = process.env.NEXT_PUBLIC_BACKEND_ABS_SERVICE_URL;
  const token = localStorage.getItem("access_token");

  const fromRFC = new Date(from).toISOString();
  const toRFC = new Date(to).toISOString();

  const url = `${backendABS}/pvn/transactions?from=${encodeURIComponent(fromRFC)}&to=${encodeURIComponent(toRFC)}`;
  const resp = await fetch(url, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!resp.ok) {
    const errBody = await resp.json().catch(() => ({}));
    throw new Error(errBody.error || `Ошибка HTTP ${resp.status}`);
  }

  return await resp.json();
};

export const paySinglePVNTransaction = async (transaction: PVNTransaction): Promise<any> => {
  const backendABS = process.env.NEXT_PUBLIC_BACKEND_ABS_SERVICE_URL;
  const token = localStorage.getItem("access_token");

  const resp = await fetch(`${backendABS}/pvn/transactions/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(transaction),
  });
  
  const result = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(result.error || `Ошибка сервера: ${resp.status}`);
  }
  if (result.error) {
    throw new Error(result.error);
  }
  return result;
};

export interface PVNSetting {
  ID?: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  atm_id: string;
  currency: number;
  cashbox_inn: string;
  cashbox_name: string;
  cashbox_account: string;
  atm_inn: string;
  atm_name: string;
  atm_account: string;
}

export const getPVNSettings = async (): Promise<PVNSetting[]> => {
  const backendABS = process.env.NEXT_PUBLIC_BACKEND_ABS_SERVICE_URL;
  const token = localStorage.getItem("access_token");

  const resp = await fetch(`${backendABS}/pvn`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!resp.ok) throw new Error(`Ошибка загрузки: ${resp.status}`);
  const json = await resp.json();
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.data)) return json.data;
  return [];
};

export const createPVNSetting = async (data: PVNSetting): Promise<any> => {
  const backendABS = process.env.NEXT_PUBLIC_BACKEND_ABS_SERVICE_URL;
  const token = localStorage.getItem("access_token");

  const resp = await fetch(`${backendABS}/pvn`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!resp.ok) throw new Error(`Ошибка создания: ${resp.status}`);
  return await resp.json().catch(() => ({}));
};

export const updatePVNSetting = async (id: number, data: PVNSetting): Promise<any> => {
  const backendABS = process.env.NEXT_PUBLIC_BACKEND_ABS_SERVICE_URL;
  const token = localStorage.getItem("access_token");

  const resp = await fetch(`${backendABS}/pvn/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!resp.ok) throw new Error(`Ошибка обновления: ${resp.status}`);
  return await resp.json().catch(() => ({}));
};
