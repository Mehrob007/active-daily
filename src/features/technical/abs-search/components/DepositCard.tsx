import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Deposit } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface DepositCardProps {
  deposit: Deposit;
  onClick: () => void;
  isSelected?: boolean;
}

export const DepositCard: React.FC<DepositCardProps> = ({ deposit, onClick, isSelected }) => {
  const { AgreementData, BalanceAccounts, SumTypes } = deposit;

  const mainAccount = BalanceAccounts?.find(acc => acc.RuleCode === 'DEPOACC');
  const incomeAccount = BalanceAccounts?.find(acc => acc.RuleCode === 'CLIACC');

  const interestRate = SumTypes?.find(s => s.Code === 'DEP_BONUS')?.Pcn || 0;

  const dateFrom = AgreementData?.DateFrom ? new Date(AgreementData.DateFrom) : null;
  const dateTo = AgreementData?.DateTo ? new Date(AgreementData.DateTo) : null;
  const now = new Date();

  let progress = 0;
  let termInfo = "";

  if (dateFrom && dateTo) {
    const total = dateTo.getTime() - dateFrom.getTime();
    const elapsed = now.getTime() - dateFrom.getTime();
    progress = Math.min(100, Math.max(0, (elapsed / total) * 100));

    if (AgreementData?.DepoTermTimeType === 'M') {
       const totalMonths = Math.round(Number(AgreementData.DepoTermTU));
       const elapsedMonths = Math.max(0, Math.round((now.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
       termInfo = `${Math.min(elapsedMonths, totalMonths)} из ${totalMonths} мес`;
    }
  }

  const formatAccountDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), 'dd.MM.yyyy', { locale: ru });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card 
      onClick={onClick}
      className={`cursor-pointer transition-all duration-300 border-2 ${
        isSelected ? 'border-bank-red shadow-lg shadow-bank-red/10' : 'border-transparent hover:border-slate-200 shadow-sm'
      }`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-900">
                Депозит - {AgreementData?.Product?.Name || "Без названия"}
              </h3>
              <Badge className={
                (AgreementData?.Status?.Code === 'ACTUAL' || AgreementData?.Status?.Name === 'Актуален')
                  ? "bg-emerald-600 text-white hover:bg-emerald-600 border-none shadow-sm"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-100 border-none"
              }>
                {AgreementData?.Status?.Name || 'Актуален'}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              <span>Дата открытия: {formatAccountDate(AgreementData?.DateFrom)}</span>
              <span>Дата окончания: {formatAccountDate(AgreementData?.DateTo)}</span>
              <span>Счет {mainAccount?.AccCode || "-"}</span>
            </div>
          </div>

          <div className="text-right">
             <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Текущая сумма депозита</p>
             <div className="text-2xl font-black text-slate-900">
                {Number(mainAccount?.Balance || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(',', '.')} <span className="text-sm font-normal text-slate-500">{mainAccount?.CurrCode || AgreementData?.Currency}</span>
             </div>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-end text-[10px] uppercase font-bold tracking-wider">
             <span className="text-slate-400 text-[10px]">Срок вклада</span>
             <span className="text-slate-600">{termInfo}</span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-100 [&>div]:bg-bank-red" />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex gap-8">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ожидаемый доход</p>
              <p className="text-sm font-black text-emerald-600">
                {Number(incomeAccount?.Balance || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(',', '.')} <span className="text-[10px] font-normal">{incomeAccount?.CurrCode || AgreementData?.Currency}</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">% Ставка</p>
              <p className="text-sm font-black text-slate-900">
                {interestRate}%
              </p>
            </div>
          </div>

          <button 
            className="text-bank-red text-xs font-bold uppercase tracking-widest hover:underline active:scale-95 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Подробнее
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
