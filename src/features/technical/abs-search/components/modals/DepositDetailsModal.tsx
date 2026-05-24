import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Deposit } from '../../types';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface DepositDetailsModalProps {
  deposit: Deposit | null;
  onClose: () => void;
}

export const DepositDetailsModal: React.FC<DepositDetailsModalProps> = ({ deposit, onClose }) => {
  if (!deposit) return null;

  const { AgreementData, BalanceAccounts, SumTypes } = deposit;

  // Find specific balance accounts
  const mainAccount = BalanceAccounts?.find(acc => acc.RuleCode === 'DEPOACC');
  
  // Find interest rate & taxes from SumTypes
  const bonusRate = SumTypes?.find(s => s.Code === 'DEP_BONUS')?.Pcn || 0;
  const penaltyRate = SumTypes?.find(s => s.Code === 'DEP_PNLTY')?.Pcn || 0;
  const taxRate = SumTypes?.find(s => s.Code === 'DEP_TAX')?.Pcn || 0;

  // Calculate progress
  const dateFrom = AgreementData?.DateFrom ? new Date(AgreementData.DateFrom) : null;
  const dateTo = AgreementData?.DateTo ? new Date(AgreementData.DateTo) : null;
  const now = new Date();
  
  let progress = 0;
  let elapsedMonths = 0;
  const totalMonths = Math.round(Number(AgreementData?.DepoTermTU || 0));

  if (dateFrom && dateTo) {
    const total = dateTo.getTime() - dateFrom.getTime();
    const elapsed = now.getTime() - dateFrom.getTime();
    progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
    
    elapsedMonths = Math.max(0, Math.round((now.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
  }

  // Department name (mapping or default)
  const departmentName = AgreementData?.Department?.Code === '5100' ? 'Садбарг' : (AgreementData?.Department?.Code || "Головной офис");

  return (
    <Dialog open={!!deposit} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-10 bg-slate-50 border-none shadow-2xl rounded-[40px] overflow-hidden">
        <DialogHeader className="mb-8">
           <DialogTitle className="text-3xl font-black text-slate-900">
              Депозит - {AgreementData?.Product?.Name}
           </DialogTitle>
        </DialogHeader>

        <div className="space-y-10">
           {/* Top Summary Blocks */}
           <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Подразделение", value: departmentName },
                { label: "Сумма первоначального взноса", value: `${AgreementData?.Amount} ${AgreementData?.Currency}` },
                { label: "% Ставка", value: `${bonusRate}%`, highlight: true },
                { label: "Срок", value: `${totalMonths} мес` },
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center min-h-[90px]">
                   <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 leading-tight">{item.label}</p>
                   <p className={`text-lg font-black ${item.highlight ? 'text-emerald-600' : 'text-slate-900'}`}>{item.value}</p>
                </div>
              ))}
           </div>

           {/* Main Progress Card */}
           <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="flex justify-between items-end mb-4">
                 <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Срок вклада</h3>
                 <span className="text-sm font-bold text-slate-600">
                    {Math.min(elapsedMonths, totalMonths)} из {totalMonths} мес
                 </span>
              </div>
              
              <Progress value={progress} className="h-4 bg-slate-50 [&>div]:bg-bank-red rounded-full mb-12" />

              <div className="grid grid-cols-3 gap-12">
                 <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ставка при досрочно расторжении</p>
                    <p className="text-xl font-black text-slate-900">{penaltyRate}%</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Подоходный налог</p>
                    <p className="text-xl font-black text-slate-900">{taxRate}%</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Счет</p>
                    <p className="text-lg font-mono font-bold text-emerald-600 truncate">{mainAccount?.AccCode || "-"}</p>
                 </div>
              </div>
           </div>

           {/* Quick Actions / Footer */}
           <div className="flex justify-end pt-4">
              <button 
                onClick={onClose}
                className="px-8 py-3 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
              >
                Закрыть детали
              </button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
