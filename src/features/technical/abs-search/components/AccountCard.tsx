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
  creditDetails?: any; 
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
    if (t === "AC" || t === "ТЕКУЩИЙ СЧЕТ" || t === "CURR") return "Текущий счет";
    if (t === "ДЕПОЗИТ" || t === "ДЕПОЗИТНЫЙ СЧЕТ" || t === "TEDP") return "Депозитный счет";
    if (t === "СЧЕТ ПО КРЕДИТУ" || t === "LLINE") return "% - счет по кредиту";
    if (t === "СЧЕТ ПО ДЕПОЗИТУ" || t === "OTHERS") return "% счет по депозиту";
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

  const typeLabel = getAccountTypeLabel(account.Type || account.accountType);
  const typeColor = getAccountTypeColor(typeLabel);
  
  const balance = creditDetails ? creditDetails.debtAmount : (account.Balance ?? account.balance);
  const currency = creditDetails ? creditDetails.currency : (account.Currency?.Code || account.currency);
  const branchName = account.Branch?.Name || account.branchName || 'Мудирияти амалиёти ш. Душанбе';
  const openDate = account.DateOpened || account.openDate || '10.01.2026';
  const accountNumber = account.Number || account.accountNumber;
  
  const statusName = account.Status?.Name || account.statusName || 'Открыт';
  const isOpened = account.Status?.Code !== 'CLOSED' && statusName.toLowerCase() !== 'закрыт';
  const statusColor = isOpened ? 'bg-[#439655] hover:bg-[#439655]' : 'bg-[#b91c1c] hover:bg-[#b91c1c]';

  return (
    <Card className="rounded-[32px] p-6 bg-white border-none shadow-sm flex flex-col relative overflow-hidden">
      {/* Badges Row */}
      <div className="flex gap-2 flex-wrap mb-6">
        <Badge className={`${statusColor} text-white px-3 py-1 rounded-full text-xs font-medium border-none`}>
          {statusName}
        </Badge>
        
        {cardData ? (
          <>
            <Badge className="bg-[#eab308] hover:bg-[#eab308] text-white px-3 py-1 rounded-full text-xs font-medium border-none">
              Карточный счет
            </Badge>
            <Badge className="bg-[#eab308] hover:bg-[#eab308] text-white px-3 py-1 rounded-full text-xs font-medium border-none">
              Карта: {cardData.cardNumber || cardData.CardNumber}
            </Badge>
          </>
        ) : (
          <Badge className={`px-3 py-1 rounded-full text-xs font-medium border-none ${typeColor}`}>
            {typeLabel}
          </Badge>
        )}
        
        {creditDetails && (
          <Badge className="bg-[#0ea5e9] hover:bg-[#0ea5e9] text-white px-3 py-1 rounded-full text-xs font-medium border-none">
            Кредит: {creditDetails.agreementNumber || creditDetails.agreementId || creditDetails.id}
          </Badge>
        )}
        
        {isMain && (
          <Badge className="bg-[#6ee7b7] hover:bg-[#6ee7b7] text-[#064e3b] px-3 py-1 rounded-full text-xs font-medium border-none">
            Основной счет в МП
          </Badge>
        )}
      </div>

      {/* Balances Row */}
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <div className="text-sm text-slate-500 font-medium">
            Остаток
          </div>
          <div className="text-[28px] font-bold text-slate-900 flex items-baseline gap-2 leading-none">
            {formatMoney(balance)} <span className="text-xl font-bold">{currency}</span>
          </div>
          <div className="text-sm text-slate-500 mt-2">
            {branchName}
          </div>
        </div>

        {cardData && (
          <div className="text-right">
            <div className="text-sm text-slate-500 font-medium mb-1">
              Остаток в ПЦ
            </div>
            <div className="text-[22px] font-bold text-slate-900 leading-none">
              {formatMoney(cardData.balance || account.balance || account.Balance)}
            </div>
          </div>
        )}
      </div>

      {/* Date */}
      <div className="text-sm text-slate-500 mb-2 font-medium">
        Дата открытия : {openDate}
      </div>

      {/* Account Number Block */}
      <div className="bg-slate-100 rounded-xl p-4 flex items-center justify-between mb-6">
        <div className="space-y-1">
          <div className="text-sm text-slate-500 font-medium">Номер счета</div>
          <div className="font-mono text-xl text-slate-800">{accountNumber}</div>
        </div>
        <Button variant="ghost" size="icon" className="text-slate-600 hover:text-black hover:bg-slate-200" onClick={() => handleCopy(accountNumber)}>
          <Copy className="size-5" />
        </Button>
      </div>

      {/* Bottom Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" className="rounded-xl border-[#b91c1c] text-[#b91c1c] hover:bg-red-50 bg-white font-medium" onClick={() => onHistoryClick(accountNumber)}>
          Выписка (АБС)
        </Button>
        <Button variant="secondary" className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border-none font-medium" onClick={() => onHistoryClick(accountNumber)}>
          История (ПЦ)
        </Button>
        <Button variant="secondary" className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border-none font-medium">
          Скачать реквизиты
        </Button>
      </div>
    </Card>
  );
};
