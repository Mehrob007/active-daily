import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AccountCardProps {
  account: any;
  cardData?: any;
  isMain?: boolean;
  creditDetails?: any; // from /api/loans if it's a loan
  onHistoryClick: (accountNumber: string) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  cardData,
  isMain,
  creditDetails,
  onHistoryClick,
}) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Скопировано', description: 'Номер успешно скопирован' });
  };

  const formatMoney = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined) return "-";
    const num = Number(amount);
    if (isNaN(num)) return amount;
    return num.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(",", ".");
  };

  const getAccountTypeLabel = (type: string) => {
    const t = type?.toUpperCase() || "";
    if (t === "AC" || t === "ТЕКУЩИЙ СЧЕТ") return "Текущий счет";
    if (t === "ДЕПОЗИТ" || t === "ДЕПОЗИТНЫЙ СЧЕТ") return "Депозитный счет";
    if (t === "СЧЕТ ПО КРЕДИТУ" || t.includes("LLINE")) return "% - счет по кредиту";
    if (t === "СЧЕТ ПО ДЕПОЗИТУ" || t.includes("OTHERS")) return "% счет по депозиту";
    if (t === "КРЕДИТНЫЙ СЧЕТ" || t === "LOAN") return "Кредитный счет";
    if (t === "КАРТОЧНЫЙ СЧЕТ" || t === "CCUR") return "Карточный счет";
    return type || "Неизвестный счет";
  };

  const getAccountTypeColor = (typeLabel: string) => {
    switch (typeLabel) {
      case 'Текущий счет': return 'bg-[#06b6d4] hover:bg-[#06b6d4] text-white';
      case '% - счет по кредиту': return 'bg-[#439655] hover:bg-[#439655] text-white';
      case 'Карточный счет': return 'bg-[#eab308] hover:bg-[#eab308] text-white';
      case 'Депозитный счет': return 'bg-[#a855f7] hover:bg-[#a855f7] text-white';
      case 'Кредитный счет': return 'bg-[#0ea5e9] hover:bg-[#0ea5e9] text-white';
      case '% счет по депозиту': return 'bg-[#c084fc] hover:bg-[#c084fc] text-white';
      default: return 'bg-slate-500 hover:bg-slate-500 text-white';
    }
  };

  const typeLabel = getAccountTypeLabel(account.accountType);
  const typeColor = getAccountTypeColor(typeLabel);

  return (
    <Card className="rounded-3xl p-6 bg-white border-none shadow-sm flex flex-col gap-6 relative overflow-hidden">
      <div className="flex gap-2 flex-wrap mb-2">
        {cardData && (
          <>
            <Badge className="bg-[#eab308] hover:bg-[#eab308] text-white px-3 py-0.5 rounded-full text-xs font-normal border-none">
              {cardData.cardNumber || cardData.CardNumber}
            </Badge>
            {cardData.cardName && (
              <Badge className="bg-[#eab308] hover:bg-[#eab308] text-white px-3 py-0.5 rounded-full text-xs font-normal border-none">
                {cardData.cardName}
              </Badge>
            )}
          </>
        )}
        {!cardData && (
          <Badge className={`px-3 py-0.5 rounded-full text-xs font-normal border-none ${typeColor}`}>
            {typeLabel}
          </Badge>
        )}
        {isMain && (
          <Badge className="bg-[#eab308] hover:bg-[#eab308] text-white px-3 py-0.5 rounded-full text-xs font-normal border-none">
            Основной счет
          </Badge>
        )}
        <Badge className="bg-[#439655] hover:bg-[#439655] text-white px-3 py-0.5 rounded-full text-xs font-normal border-none">
          Открыт
        </Badge>
      </div>

      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="text-sm text-slate-400">
            {creditDetails ? 'Сумма долга' : (cardData ? 'Остаток в АБС' : 'Остаток')}
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {formatMoney(creditDetails ? creditDetails.debtAmount : account.balance || account.Balance)} {creditDetails ? creditDetails.currency : account.currency || account.Currency?.Code}
          </div>
          <div className="text-sm text-slate-500 mt-2">
            {account.branchName || 'Филиал не указан'}
          </div>
        </div>

        {cardData && (
          <div className="text-right">
            <div className="text-sm text-slate-400 mb-1">
              Остаток в ПЦ
            </div>
            <div className="text-xl text-slate-800">
              {formatMoney(cardData.balance || account.balance || account.Balance)} {account.currency || account.Currency?.Code}
            </div>
          </div>
        )}
      </div>

      <div className="text-sm text-slate-400">
        Дата открытия: 10.01.2026
      </div>

      <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-xs text-slate-400">Номер счета</div>
          <div className="font-mono text-base text-slate-700">{account.accountNumber || account.Number}</div>
        </div>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600" onClick={() => handleCopy(account.accountNumber || account.Number)}>
          <Copy className="size-5" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" className="rounded-full border-red-200 text-red-600 hover:bg-red-50" onClick={() => onHistoryClick(account.accountNumber || account.Number)}>
          Выписка
        </Button>
        <Button variant="outline" className="rounded-full bg-slate-50 border-none text-slate-700 hover:bg-slate-100" onClick={() => onHistoryClick(account.accountNumber || account.Number)}>
          История
        </Button>
        <Button variant="outline" className="rounded-full bg-slate-50 border-none text-slate-700 hover:bg-slate-100">
          Реквизиты
        </Button>
        <Button variant="outline" className="rounded-full bg-slate-50 border-none text-slate-700 hover:bg-slate-100 ml-auto">
          Скачать реквизиты
        </Button>
      </div>
    </Card>
  );
};
