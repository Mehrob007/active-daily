import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Deposit } from '../../types';
import { Progress } from '@/components/ui/progress';

interface DepositDetailsViewProps {
  deposit: Deposit | null;
  onBack: () => void;
}

export const DepositDetailsView: React.FC<DepositDetailsViewProps> = ({ deposit, onBack }) => {
  if (!deposit) return null;

  const { AgreementData, BalanceAccounts, SumTypes } = deposit;

  const mainAccount = BalanceAccounts?.find(acc => acc.RuleCode === 'DEPOACC');

  const bonusRate = SumTypes?.find(s => s.Code === 'DEP_BONUS')?.Pcn || 0;
  const penaltyRate = SumTypes?.find(s => s.Code === 'DEP_PNLTY')?.Pcn || 0;
  const taxRate = SumTypes?.find(s => s.Code === 'DEP_TAX')?.Pcn || 0;

  const dateFrom = AgreementData?.DateFrom ? new Date(AgreementData.DateFrom) : null;
  const dateTo = AgreementData?.DateTo ? new Date(AgreementData.DateTo) : null;
  const now = new Date();

  let progress = 0;
  let elapsedMonths = 0;
  const totalMonths = Math.round(Number(AgreementData?.DepoTermTU || 0));
  const termSuffix = AgreementData?.DepoTermTimeType === 'M' ? 'мес' : 'дн';

  if (dateFrom && dateTo) {
    const total = dateTo.getTime() - dateFrom.getTime();
    const elapsed = now.getTime() - dateFrom.getTime();
    progress = Math.min(100, Math.max(0, (elapsed / total) * 100));

    elapsedMonths = Math.max(0, Math.round((now.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
  }

  // Assuming 5100 -> Садбарг, otherwise fallback
  const departmentName = (AgreementData as any)?.Department?.Code === '5100' ? 'Садбарг' : ((AgreementData as any)?.Department?.Name || "Садбарг");

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-border/40">
      <div className="flex items-center gap-4 p-6 border-b border-border/40">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 rounded-full">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Депозит - {AgreementData?.Product?.Name}</h2>
          <p className="text-sm text-muted-foreground">Детальная информация по депозиту</p>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-10">
          
          {/* Верхний ряд параметров */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50/50 p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
               <p className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Подразделение</p>
               <p className="text-lg font-bold text-slate-900">{departmentName}</p>
            </div>
            <div className="bg-slate-50/50 p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
               <p className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Сумма первоначального взноса</p>
               <p className="text-lg font-bold text-slate-900">{AgreementData?.Amount} {AgreementData?.Currency}</p>
            </div>
            <div className="bg-slate-50/50 p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
               <p className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">% Ставка</p>
               <p className="text-lg font-bold text-emerald-600">{bonusRate}%</p>
            </div>
            <div className="bg-slate-50/50 p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
               <p className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Срок</p>
               <p className="text-lg font-bold text-slate-900">{totalMonths} {termSuffix}</p>
            </div>
          </div>

          {/* Основной блок детализации */}
          <div className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 relative overflow-hidden">
             
            <div className="mb-10">
               <div className="flex justify-between items-end mb-4">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Срок вклада</h3>
                  <span className="text-lg font-bold text-slate-700">
                     {Math.min(elapsedMonths, totalMonths)} из {totalMonths} {termSuffix}
                  </span>
               </div>
               <Progress value={progress} className="h-4 bg-slate-100 [&>div]:bg-bank-red rounded-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-slate-100 pt-8">
               <div className="space-y-1">
                  <p className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Ставка при досрочном расторжении</p>
                  <p className="text-xl font-bold text-slate-900">{penaltyRate}%</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Подоходный налог</p>
                  <p className="text-xl font-bold text-slate-900">{taxRate}%</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Счет</p>
                  <p className="text-xl font-mono font-bold text-slate-900 truncate">{mainAccount?.AccCode || "-"}</p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
