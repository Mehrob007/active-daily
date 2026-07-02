import { apiClient } from '@/services/api-client';

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

export interface CashbackSetting {
  ID?: number;
  id?: number;
  card_number?: string;
  card_id?: string;
  response_code?: string;
  reqamt?: number;
  amount?: number;
  conamt?: number;
  acctbal?: number;
  netbal?: number;
  utrnno?: number;
  currency?: number;
  conCurrency?: number;
  reversal?: number;
  transaction_type?: string[];
  mcc?: number;
  atm_id?: string;
  account?: string;
  from_date?: string;
  to_date?: string;
  from_time?: string;
  to_time?: string;
  exclude_transaction_types?: string;
  exclude_atm_ids?: string;
  exclude_mcc?: string;
  exclude_accounts?: string;
  account_withdraw?: string;
  idn_withdraw?: string;
  full_name_withdraw?: string;
  cashback_percentage?: number;
  cashback_name?: string;
  cashback_priority?: number;
  is_active?: boolean;
}

const parseTransactionType = (value: any): string[] => {
  if (Array.isArray(value)) return value.flatMap(v => parseTransactionType(v));
  if (value == null || value === "") return [];

  let str = String(value).trim();

  try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) return parsed.flatMap(v => parseTransactionType(v));
      if (typeof parsed === "string") str = parsed.trim();
  } catch { }

  if (str.startsWith("{") && str.endsWith("}")) {
      const inner = str.slice(1, -1).trim();
      if (!inner) return [];
      return inner.split(",").map(v => v.trim().replace(/^["'\\]+|["'\\]+$/g, "")).filter(Boolean);
  }

  return str.split(",").map(v => v.trim()).filter(Boolean);
};

const normalizeItem = (item: any): CashbackSetting => ({
  ...item,
  transaction_type: parseTransactionType(item.transaction_type),
});

const toDateOnly = (value: any) => {
  if (!value) return "";
  return String(value).includes("T") ? String(value).slice(0, 10) : value;
};

const buildPayload = (raw: any) => ({
  ...raw,
  reqamt: parseFloat(raw.reqamt) || 0,
  amount: parseFloat(raw.amount) || 0,
  conamt: parseFloat(raw.conamt) || 0,
  acctbal: parseFloat(raw.acctbal) || 0,
  netbal: parseFloat(raw.netbal) || 0,
  utrnno: parseInt(raw.utrnno, 10) || 0,
  currency: parseInt(raw.currency, 10) || 0,
  conCurrency: parseInt(raw.conCurrency, 10) || 0,
  reversal: parseInt(raw.reversal, 10) || 0,
  mcc: parseInt(raw.mcc, 10) || 0,
  cashback_percentage: parseFloat(raw.cashback_percentage) || 0,
  cashback_priority: parseInt(raw.cashback_priority, 10) || 0,
  from_date: toDateOnly(raw.from_date),
  to_date: toDateOnly(raw.to_date),
  transaction_type: Array.isArray(raw.transaction_type) ? raw.transaction_type : parseTransactionType(raw.transaction_type),
});

export const fetchCashbackSettings = async (): Promise<CashbackSetting[]> => {
  const url = `${BACKEND_URL}/cashback-settings`;
  const response = await apiClient.get<any>(url, { baseURL: '' });
  
  let rawItems = [];
  if (Array.isArray(response)) rawItems = response;
  else if (response && Array.isArray(response.data)) rawItems = response.data;
  
  return rawItems.map(normalizeItem);
};

export const addCashbackSetting = async (payload: CashbackSetting): Promise<void> => {
  const url = `${BACKEND_URL}/cashback-settings`;
  await apiClient.post(url, buildPayload(payload), { baseURL: '' });
};

export const updateCashbackSetting = async (id: number, payload: CashbackSetting): Promise<void> => {
  const url = `${BACKEND_URL}/cashback-settings/${id}`;
  await apiClient.put(url, buildPayload(payload), { baseURL: '' });
};

export const deleteCashbackSetting = async (id: number): Promise<void> => {
  const url = `${BACKEND_URL}/cashback-settings/${id}`;
  await apiClient.delete(url, { baseURL: '' });
};
