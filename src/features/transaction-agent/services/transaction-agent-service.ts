export interface TransactionTypeItem {
  id: string | number;
  type: string | number;
  name: string;
  number: string | number;
}

const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_BACKEND_PROCESSING_URL;
  if (!url) {
    throw new Error('Не настроен NEXT_PUBLIC_BACKEND_PROCESSING_URL');
  }
  return url;
};

export const getTransactions = async (): Promise<TransactionTypeItem[]> => {
  const res = await fetch(`${getBaseUrl()}/api/Transactions/types/all`);
  if (!res.ok) {
    throw new Error('Ошибка при загрузке типов транзакций');
  }
  return res.json();
};

export const putTransactions = async (data: TransactionTypeItem) => {
  const res = await fetch(`${getBaseUrl()}/api/Transactions/transaction-type/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      number: Number(data.number),
      type: Number(data.type),
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ошибка при обновлении названия транзакции');
  }
  return res.json().catch(() => ({}));
};

export const putTransactionsNumber = async (data: TransactionTypeItem) => {
  const res = await fetch(`${getBaseUrl()}/api/Transactions/transaction-type/update-number`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      newNumber: Number(data.number),
      type: Number(data.type),
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ошибка при обновлении вида операции');
  }
  return res.json().catch(() => ({}));
};
