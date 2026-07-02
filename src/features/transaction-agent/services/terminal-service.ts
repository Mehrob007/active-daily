export interface TerminalAssignItem {
  id?: string | number;
  transactionType: string | number;
  description: string;
  atmId: string;
  currency: string | null;
}

const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_BACKEND_PROCESSING_URL;
  if (!url) {
    throw new Error('Не настроен NEXT_PUBLIC_BACKEND_PROCESSING_URL');
  }
  return url;
};

export const getTerminalNames = async (): Promise<TerminalAssignItem[]> => {
  const res = await fetch(`${getBaseUrl()}/api/TransactionTypeAtmDescriptions`);
  if (!res.ok) {
    throw new Error('Ошибка при загрузке списка терминалов');
  }
  return res.json();
};

export const createTerminalName = async (data: TerminalAssignItem) => {
  const res = await fetch(`${getBaseUrl()}/api/TransactionTypeAtmDescriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      transactionType: Number(data.transactionType),
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ошибка при создании терминала');
  }
  return res.json().catch(() => ({}));
};

export const updateTerminalName = async (data: TerminalAssignItem) => {
  const res = await fetch(`${getBaseUrl()}/api/TransactionTypeAtmDescriptions`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      transactionType: Number(data.transactionType),
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ошибка при обновлении терминала');
  }
  return res.json().catch(() => ({}));
};

export const deleteTerminalName = async (id: string | number) => {
  const res = await fetch(`${getBaseUrl()}/api/TransactionTypeAtmDescriptions/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ошибка при удалении терминала');
  }
  return res.json().catch(() => ({}));
};
