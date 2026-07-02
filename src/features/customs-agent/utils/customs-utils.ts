import { CustomsTransaction } from '../services/customs-service';

export const isWorkingHours = (): boolean => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  return currentHour < 17 || (currentHour === 17 && currentMinute <= 10);
};

export const isPaidCustoms = (row: CustomsTransaction): boolean => {
  if (row.isPayed !== undefined && row.isPayed !== null) {
    return Boolean(row.isPayed);
  }

  if (!row.payedAt) return false;
  if (row.payedAt.includes('0001-01-01')) return false;
  try {
    const date = new Date(row.payedAt);
    return date.getFullYear() >= 2000;
  } catch {
    return false;
  }
};

export const getPaymentStatus = (row: CustomsTransaction): 'paid' | 'already_paid' | 'pending' => {
  if (row.status === 'Paid' || row.status === 'Success' || row.status === 'success') return 'paid';
  if (isPaidCustoms(row)) return 'already_paid';
  return 'pending';
};

export const formatDateForDisplay = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    if (dateString.includes('0001-01-01')) {
      return 'Не оплачено';
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${yyyy}-${MM}-${dd} ${hh}:${mi}:${ss}`;
  } catch {
    return dateString;
  }
};

export const CUSTOMS_COLUMNS_TRANSLATION: Record<string, string> = {
  id: 'ID',
  status: 'Статус платежа',
  amount: 'Сумма',
  docId: 'Номер документа',
  transactionId: 'Номер транзакций',
  date: 'Дата',
  type_id: 'Тип',
  emailToBeNotified: 'Почта',
  meanOfPayment: 'Тип платежа',
  bankCode: 'БИК',
  payerINN: 'ИНН плательщика',
  payerName: 'Имя плательщика',
  payerBankName: 'Банк плательщика',
  payerBankCode: 'БИК банка плательщика',
  payerAcc: 'Номер счета',
  recINN: 'ИНН получателя',
  recName: 'Имя получателя',
  recBankName: 'Банк получателя',
  recBankCode: 'Код банка получателя',
  recAcc: 'Номер счета получателя',
};
