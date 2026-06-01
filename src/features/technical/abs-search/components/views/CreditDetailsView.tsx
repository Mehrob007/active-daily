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
            absService.getCreditGraphs(credit.referenceId!).catch(() => []), // fallback to empty array if fails
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

  // Process graphs
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
    // Update status/type if they were missing
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
            
            {/* Блок 1: Параметры кредита */}
            <section>
              <h3 className="text-lg font-bold mb-4 text-foreground">Параметры кредита</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <div className="flex flex-col gap-1"><span className="text-muted-foreground text-[11px] uppercase font-bold tracking-wider">Номер договора</span><span className="font-medium text-base">{credit.contractNumber || '-'}</span></div>
                <div className="flex flex-col gap-1"><span className="text-muted-foreground text-[11px] uppercase font-bold tracking-wider">Reference ID</span><span className="font-medium text-base">{credit.referenceId || '-'}</span></div>
                <div className="flex flex-col gap-1"><span className="text-muted-foreground text-[11px] uppercase font-bold tracking-wider">Статус</span><span className="font-medium text-base">{credit.statusName || '-'}</span></div>
                <div className="flex flex-col gap-1"><span className="text-muted-foreground text-[11px] uppercase font-bold tracking-wider">Сумма</span><span className="font-semibold text-base text-bank-red">{credit.amount} {credit.currency}</span></div>
                <div className="flex flex-col gap-1"><span className="text-muted-foreground text-[11px] uppercase font-bold tracking-wider">Дата начала</span><span className="font-medium text-base">{loanDetails?.startDate || '-'}</span></div>
                <div className="flex flex-col gap-1"><span className="text-muted-foreground text-[11px] uppercase font-bold tracking-wider">Дата окончания</span><span className="font-medium text-base">{loanDetails?.endDate || '-'}</span></div>
                <div className="flex flex-col gap-1"><span className="text-muted-foreground text-[11px] uppercase font-bold tracking-wider">Дата документа</span><span className="font-medium text-base">{credit.documentDate || loanDetails?.documentDate || '-'}</span></div>
                <div className="flex flex-col gap-1"><span className="text-muted-foreground text-[11px] uppercase font-bold tracking-wider">Код клиента</span><span className="font-medium text-base">{credit.clientCode || '-'}</span></div>
                <div className="flex flex-col gap-1"><span className="text-muted-foreground text-[11px] uppercase font-bold tracking-wider">Код продукта</span><span className="font-medium text-base">{credit.productCode || '-'}</span></div>
                <div className="flex flex-col gap-1"><span className="text-muted-foreground text-[11px] uppercase font-bold tracking-wider">Название продукта</span><span className="font-medium text-base line-clamp-1" title={credit.productName}>{credit.productName || '-'}</span></div>
                <div className="flex flex-col gap-1"><span className="text-muted-foreground text-[11px] uppercase font-bold tracking-wider">Цель кредита</span><span className="font-medium text-base line-clamp-1" title={loanDetails?.creditPurpose}>{loanDetails?.creditPurpose || '-'}</span></div>
                <div className="flex flex-col gap-1"><span className="text-muted-foreground text-[11px] uppercase font-bold tracking-wider">Срок</span><span className="font-medium text-base">{loanDetails?.term ? `${loanDetails.term} мес.` : '-'}</span></div>
              </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Блок 2: Счета кредитов */}
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

              {/* Блок 3: Остатки кредитов */}
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

            {/* Блок 4: График платежей */}
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
