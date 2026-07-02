export const CURRENCIES: Record<string, string> = {
  '643': 'RUB',
  '840': 'USD',
  '978': 'EUR',
  '972': 'TJS',
  '398': 'KZT', // Added just in case
};

export const getCurrencyCode = (numericCode: string | number | null): string => {
  if (!numericCode) return '';
  const codeStr = String(numericCode);
  return CURRENCIES[codeStr] || codeStr;
};

export const POPULAR_CURRENCIES = [
  { value: '', label: 'Не указана' },
  { value: '972', label: 'TJS (972)' },
  { value: '643', label: 'RUB (643)' },
  { value: '840', label: 'USD (840)' },
  { value: '978', label: 'EUR (978)' },
  { value: '398', label: 'KZT (398)' },
];
