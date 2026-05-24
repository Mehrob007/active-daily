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
import { Separator } from '@/components/ui/separator';

interface DepositDetailsModalProps {
  deposit: Deposit | null;
  onClose: () => void;
}

export const DepositDetailsModal: React.FC<DepositDetailsModalProps> = ({ deposit, onClose }) => {
  if (!deposit) return null;

  const { AgreementData, BalanceAccounts, SumTypes } = deposit;

  return (
    <Dialog open={!!deposit} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl font-bold">
              {AgreementData?.Product?.Name}
            </DialogTitle>
            <Badge className={
              AgreementData?.Status?.Code === 'ACTUAL' 
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : "bg-slate-50 text-slate-500 border-slate-200"
            }>
              {AgreementData?.Status?.Name}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            Договор №{AgreementData?.Code}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 pt-2">
          <div className="space-y-8">
            {/* Agreement Section */}
            <section className="space-y-4">
              <h3 className="text-xs uppercase font-black tracking-widest text-slate-400">Параметры договора</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { label: "Дата открытия", value: AgreementData?.DateFrom },
                  { label: "Дата окончания", value: AgreementData?.DateTo },
                  { label: "Срок", value: `${AgreementData?.DepoTermTU} ${AgreementData?.DepoTermTimeType === 'M' ? 'мес' : AgreementData?.DepoTermTimeType}` },
                  { label: "Сумма договора", value: `${AgreementData?.Amount} ${AgreementData?.Currency}` },
                  { label: "Валюта", value: AgreementData?.Currency },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-semibold">{item.value || "-"}</p>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* Accounts Section */}
            <section className="space-y-4">
              <h3 className="text-xs uppercase font-black tracking-widest text-slate-400">Счета и остатки</h3>
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Тип счета</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Номер счета</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-500 uppercase tracking-wider">Остаток</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {BalanceAccounts?.map((acc, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-600">{acc.RuleCode}</td>
                        <td className="px-4 py-3 font-mono text-slate-900">{acc.AccCode}</td>
                        <td className="px-4 py-3 text-right font-bold text-bank-red">
                          {Number(acc.Balance).toLocaleString('ru-RU')} {acc.CurrCode}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <Separator />

            {/* Sum Types Section */}
            <section className="space-y-4">
              <h3 className="text-xs uppercase font-black tracking-widest text-slate-400">Дополнительные показатели</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SumTypes?.map((st, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-medium text-slate-600">{st.Name}</span>
                    <Badge variant="secondary" className="bg-white text-slate-900 font-bold border-slate-200">
                      {st.Pcn}{st.Code.includes('PERCENT') || st.Code.includes('BONUS') ? '%' : ''}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
