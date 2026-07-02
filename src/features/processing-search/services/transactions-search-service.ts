export interface TransactionsSearchParams {
  cardNumber?: string;
  cardId?: string;
  responseCode?: string;
  reqamt?: number;
  amount?: number;
  conamt?: number;
  acctbal?: number;
  netbal?: number;
  utrnno?: number;
  currency?: number;
  conCurrency?: number;
  reversal?: number;
  transactionTypes?: string[];
  atmId?: string;
  mcc?: number;
  account?: string;
  fromDate?: string;
  toDate?: string;
  fromTime?: string;
  toTime?: string;
  excludeTransactionTypes?: string;
  excludeAtmIds?: string;
  excludeMcc?: string;
  excludeAccounts?: string;
}

export interface ProcessingTransaction {
  id: string | number;
  localTransactionDate: string;
  localTransactionTime: string;
  responseDescription: string;
  responseCode: string;
  cardNumber: string;
  cardId: string;
  transactionTypeName: string;
  transactionType: string | number;
  transactionTypeNumber: number;
  amount: number;
  currency: number;
  conamt: number;
  conCurrency: number;
  acctbal: number;
  netbal: number;
  utrnno: string | number;
  terminalId: string;
  atmId: string;
  reqamt: number;
  terminalAddress: string;
  mcc: string | number;
  account: string;
  reversal: number;
  nationalAmount?: number;
  [key: string]: any;
}

const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_PROCESSING_URL || '';
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

export const fetchTransactionsSearch = async (params: TransactionsSearchParams): Promise<ProcessingTransaction[]> => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)));
    } else {
      searchParams.append(key, String(value));
    }
  });

  const url = `${getBackendUrl()}/api/Transactions/search-transactions?${searchParams.toString()}`;
  
  const res = await fetch(url, {
    method: 'GET',
    headers: { ...getAuthHeaders() },
  });
  
  if (!res.ok) {
    throw new Error(`Ошибка HTTP ${res.status}`);
  }
  
  return res.json();
};

export const getCurrencyCode = (currencyCode: number | string | undefined): string => {
  if (!currencyCode) return '';
  const codeStr = String(currencyCode);
  switch (codeStr) {
    case '972': return 'TJS';
    case '840': return 'USD';
    case '978': return 'EUR';
    case '643': return 'RUB';
    default: return codeStr;
  }
};
