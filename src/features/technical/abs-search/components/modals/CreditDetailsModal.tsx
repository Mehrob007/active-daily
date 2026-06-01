import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { loanSoapService } from '../../services/loan-service';
import { absService } from '../../services/abs-service';
import { Credit } from '../../types';

interface CreditDetailsModalProps {
  credit: Credit | null;
  onClose: () => void;
}

export const CreditDetailsModal: React.FC<CreditDetailsModalProps> = ({ credit, onClose }) => {
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
    <Dialog open={!!credit} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Детали кредита: {credit.contractNumber}</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-10 text-center">Загрузка данных...</div>
        ) : (
          <div className="space-y-8 mt-4">
            
            {/* Блок 1: Параметры кредита */}
            <div>
              <h3 className="text-lg font-bold mb-4">Параметры кредита</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex flex-col"><span className="text-muted-foreground text-xs uppercase font-bold">Номер договора</span><span className="font-medium">{credit.contractNumber || '-'}</span></div>
                <div className="flex flex-col"><span className="text-muted-foreground text-xs uppercase font-bold">Reference ID</span><span className="font-medium">{credit.referenceId || '-'}</span></div>
                <div className="flex flex-col"><span className="text-muted-foreground text-xs uppercase font-bold">Статус</span><span className="font-medium">{credit.statusName || '-'}</span></div>
                <div className="flex flex-col"><span className="text-muted-foreground text-xs uppercase font-bold">Сумма</span><span className="font-medium">{credit.amount} {credit.currency}</span></div>
                <div className="flex flex-col"><span className="text-muted-foreground text-xs uppercase font-bold">Дата начала</span><span className="font-medium">{loanDetails?.startDate || '-'}</span></div>
                <div className="flex flex-col"><span className="text-muted-foreground text-xs uppercase font-bold">Дата окончания</span><span className="font-medium">{loanDetails?.endDate || '-'}</span></div>
                <div className="flex flex-col"><span className="text-muted-foreground text-xs uppercase font-bold">Дата документа</span><span className="font-medium">{credit.documentDate || loanDetails?.documentDate || '-'}</span></div>
                <div className="flex flex-col"><span className="text-muted-foreground text-xs uppercase font-bold">Код клиента</span><span className="font-medium">{credit.clientCode || '-'}</span></div>
                <div className="flex flex-col"><span className="text-muted-foreground text-xs uppercase font-bold">Код продукта</span><span className="font-medium">{credit.productCode || '-'}</span></div>
                <div className="flex flex-col"><span className="text-muted-foreground text-xs uppercase font-bold">Название продукта</span><span className="font-medium">{credit.productName || '-'}</span></div>
                <div className="flex flex-col"><span className="text-muted-foreground text-xs uppercase font-bold">Цель кредита</span><span className="font-medium">{loanDetails?.creditPurpose || '-'}</span></div>
                <div className="flex flex-col"><span className="text-muted-foreground text-xs uppercase font-bold">Срок</span><span className="font-medium">{loanDetails?.term ? `${loanDetails.term} мес.` : '-'}</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Блок 2: Счета кредитов */}
              <div>
                <h3 className="text-lg font-bold mb-4">Счета кредита</h3>
                <div className="bg-white border rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Опция оплаты</th>
                        <th className="px-4 py-3">Номер счета</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loanDetails?.paymentOptions?.length > 0 ? (
                        loanDetails.paymentOptions.map((opt: any, idx: number) => (
                          <tr key={idx} className="border-t">
                            <td className="px-4 py-3 font-medium">{opt.name}</td>
                            <td className="px-4 py-3 text-slate-600">{opt.accCode}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="px-4 py-4 text-center text-muted-foreground">Нет данных</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Блок 3: Остатки кредитов */}
              <div>
                <h3 className="text-lg font-bold mb-4">Остатки кредита</h3>
                <div className="bg-white border rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Код</th>
                        <th className="px-4 py-3">Счет</th>
                        <th className="px-4 py-3">Сумма</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loanDetails?.balances?.length > 0 ? (
                        loanDetails.balances.map((bal: any, idx: number) => (
                          <tr key={idx} className="border-t">
                            <td className="px-4 py-3 font-medium">{bal.code || bal.nps}</td>
                            <td className="px-4 py-3 text-slate-600">{bal.name || bal.accCode}</td>
                            <td className="px-4 py-3 font-medium text-right whitespace-nowrap">{bal.amount}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-4 text-center text-muted-foreground">Нет данных</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Блок 4: График платежей */}
            <div>
              <h3 className="text-lg font-bold mb-4">График платежей</h3>
              <div className="bg-white border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Дата погашения</th>
                        <th className="px-4 py-3 text-right">Сумма платежа</th>
                        <th className="px-4 py-3 text-right">Основной долг</th>
                        <th className="px-4 py-3 text-right">Проценты</th>
                        <th className="px-4 py-3">Статус</th>
                        <th className="px-4 py-3">Тип</th>
                      </tr>
                    </thead>
                    <tbody>
                      {graphRows.length > 0 ? (
                        graphRows.map((row: any, idx: number) => {
                          const total = (row.principal + row.interest).toFixed(2);
                          return (
                            <tr key={idx} className="border-t hover:bg-slate-50">
                              <td className="px-4 py-3 whitespace-nowrap">{row.date}</td>
                              <td className="px-4 py-3 text-right font-medium">{total}</td>
                              <td className="px-4 py-3 text-right">{row.principal.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right">{row.interest.toFixed(2)}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                  row.status === 'Выплачен' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {row.status || '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-600">{row.type || '-'}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">График платежей не найден</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
