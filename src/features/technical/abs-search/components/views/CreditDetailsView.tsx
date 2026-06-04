import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loanSoapService } from '../../services/loan-service';
import { absService } from '../../services/abs-service';
import { Credit } from '../../types';

interface CreditDetailsViewProps {
  credit: Credit | null;
  onBack: () => void;
}

export const CreditDetailsView: React.FC<CreditDetailsViewProps> = ({ credit, onBack }) => {
  const [loanDetails, setLoanDetails] = useState<any>(null);
  const [graphs, setGraphs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (credit && credit.referenceId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [detailsRes, graphsRes] = await Promise.all([
            loanSoapService.getLoanDetails(credit.referenceId!),
            absService.getCreditGraphs(credit.referenceId!).catch(() => []), 
          ]);
          setLoanDetails(detailsRes);
          setGraphs(Array.isArray(graphsRes) ? graphsRes : (graphsRes?.data || []));
        } catch (error) {
          console.error('Error fetching credit details:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [credit]);

  if (!credit) return null;

  
  const groupedGraphs = graphs.reduce((acc: any, item: any) => {
    const date = item.PaymentDate?.split(' ')[0] || item.PaymentDate;
    if (!acc[date]) {
      acc[date] = {
        date,
        principal: 0,
        interest: 0,
        status: item.Status,
        type: item.Type,
      };
    }
    const amount = parseFloat(item.CalculatingAmount || '0');
    if (item.Code === 'CR_PD' || item.LongName === 'Основной долг') {
      acc[date].principal += amount;
    } else if (item.Code === 'CR_INTER' || item.LongName === 'Проценты по кредиту') {
      acc[date].interest += amount;
    }
    
    if (!acc[date].status && item.Status) acc[date].status = item.Status;
    if (!acc[date].type && item.Type) acc[date].type = item.Type;

    return acc;
  }, {});

  const graphRows = Object.values(groupedGraphs).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-border/40">
      <div className="flex items-center gap-4 p-6 border-b border-border/40">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 rounded-full">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Детали кредита: {credit.contractNumber}</h2>
          <p className="text-sm text-muted-foreground">Подробная информация о кредите, счетах и графике платежей</p>
        </div>
      </div>
      
      <div className="p-6">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
            <div className="size-8 animate-spin rounded-full border-2 border-bank-red/20 border-t-bank-red mb-4" />
            <p className="text-sm font-medium">Загрузка данных по кредиту...</p>
          </div>
        ) : (
          <div className="space-y-10">
            
            {}
            <section>
              <h3 className="text-lg font-bold mb-4 text-foreground">Параметры кредита</h3>
              
              {}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-center">
                  <span className="text-muted-foreground text-xs font-medium">Подразделение</span>
                  <span className="font-bold text-base mt-1">{loanDetails?.department || '-'}</span>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-center">
                  <span className="text-muted-foreground text-xs font-medium">Сумма кредита</span>
                  <span className="font-bold text-base mt-1">{credit.amount} {credit.currency}</span>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-center">
                  <span className="text-muted-foreground text-xs font-medium">% Ставка</span>
                  <span className="font-bold text-base mt-1 text-green-600">{loanDetails?.percentRate ? `${loanDetails.percentRate} %` : '-'}</span>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-center">
                  <span className="text-muted-foreground text-xs font-medium">Срок</span>
                  <span className="font-bold text-base mt-1">{loanDetails?.term ? `${loanDetails.term} мес` : '-'}</span>
                </div>
              </div>

              {}
              <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">Цель кредита: {loanDetails?.creditPurpose || '-'}</h2>
                <div className="text-sm text-muted-foreground mt-2 mb-8">
                  Дата открытия: {loanDetails?.startDate || '-'} | Дата окончания: {loanDetails?.endDate || '-'}
                </div>
                
                {}
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-muted-foreground text-sm">Погашено</span>
                    <div className="flex flex-col items-end">
                      <span className="text-muted-foreground text-xs mb-1">Остаток задолженности</span>
                      <span className="font-bold text-xl text-slate-900">
                        {new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
                          loanDetails?.balances?.reduce((acc: number, bal: any) => acc + parseFloat(bal.balance || 0), 0) || 0
                        )} {credit.currency}
                      </span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-bank-red rounded-full transition-all duration-1000" 
                      style={{ 
                        width: `${Math.max(0, Math.min(100, (1 - ((loanDetails?.balances?.reduce((acc: number, bal: any) => acc + parseFloat(bal.balance || 0), 0) || 0) / (parseFloat(String(credit.amount)) || 1))) * 100))}%` 
                      }}
                    />
                  </div>
                </div>

                {}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm mb-1.5">Код клиента</span>
                    <span className="font-bold text-lg text-slate-800">{credit.clientCode || '-'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm mb-1.5">Штраф за просрочку</span>
                    <span className="font-bold text-lg text-bank-red">{loanDetails?.penaltyRate ? `${loanDetails.penaltyRate} %` : '0 %'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm mb-1.5">Кредитный эксперт</span>
                    <span className="font-bold text-lg text-slate-800">{loanDetails?.clientDea || '-'}</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {}
              <section>
                <h3 className="text-lg font-bold mb-4 text-foreground">Счета кредита</h3>
                <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/80 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-5 py-4 font-semibold tracking-wider">Опция оплаты</th>
                        <th className="px-5 py-4 font-semibold tracking-wider">Номер счета</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loanDetails?.paymentOptions?.length > 0 ? (
                        loanDetails.paymentOptions.map((opt: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-4 font-medium text-slate-900">{opt.name}</td>
                            <td className="px-5 py-4 text-slate-600 font-mono text-xs">{opt.accCode}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="px-5 py-8 text-center text-muted-foreground bg-slate-50/30">Счета не найдены</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {}
              <section>
                <h3 className="text-lg font-bold mb-4 text-foreground">Остатки кредита</h3>
                <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/80 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-5 py-4 font-semibold tracking-wider">Код</th>
                        <th className="px-5 py-4 font-semibold tracking-wider">Счет</th>
                        <th className="px-5 py-4 font-semibold tracking-wider text-right">Сумма</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loanDetails?.balances?.length > 0 ? (
                        loanDetails.balances.map((bal: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-4 font-medium text-slate-900">{bal.code || bal.nps}</td>
                            <td className="px-5 py-4 text-slate-600 font-mono text-xs">{bal.name || bal.accCode}</td>
                            <td className="px-5 py-4 font-semibold text-right whitespace-nowrap">{bal.amount}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-5 py-8 text-center text-muted-foreground bg-slate-50/30">Остатки не найдены</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {}
            <section>
              <h3 className="text-lg font-bold mb-4 text-foreground">График платежей</h3>
              <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/80 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-5 py-4 font-semibold tracking-wider">Дата погашения</th>
                        <th className="px-5 py-4 font-semibold tracking-wider text-right">Сумма платежа</th>
                        <th className="px-5 py-4 font-semibold tracking-wider text-right">Основной долг</th>
                        <th className="px-5 py-4 font-semibold tracking-wider text-right">Проценты</th>
                        <th className="px-5 py-4 font-semibold tracking-wider">Статус</th>
                        <th className="px-5 py-4 font-semibold tracking-wider">Тип</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {graphRows.length > 0 ? (
                        graphRows.map((row: any, idx: number) => {
                          const total = (row.principal + row.interest).toFixed(2);
                          return (
                            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-900">{row.date}</td>
                              <td className="px-5 py-4 text-right font-bold text-bank-red">{total}</td>
                              <td className="px-5 py-4 text-right text-slate-600">{row.principal.toFixed(2)}</td>
                              <td className="px-5 py-4 text-right text-slate-600">{row.interest.toFixed(2)}</td>
                              <td className="px-5 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                                  row.status === 'Выплачен' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {row.status || '-'}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-xs text-slate-500 font-medium">{row.type || '-'}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground bg-slate-50/30">
                            <p className="font-medium">График платежей пуст</p>
                            <p className="text-xs mt-1">Возможно, данные еще не сформированы</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  );
};
