'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { DataTable } from '@/components/banking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Download,
  Filter,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  CreditCard,
  History,
  FileText,
} from 'lucide-react';
import { qrAgentService } from '../services/qr-agent-service';
import { QRStatistics } from '../components/QRStatistics';
import { QRTransaction, QRBank, QRMerchant } from '../types';
import { toast } from '@/hooks/use-toast';
import { ColumnDef } from '@tanstack/react-table';
import { absService } from '@/features/technical/abs-search/services/abs-service';
import { TYPE_SEARCH_CLIENT } from '@/features/technical/abs-search/hooks/useAbsSearch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RepayModal,
} from '@/features/technical/abs-search/components/modals/RepayModal';
import {
  CreditDetailsModal,
} from '@/features/technical/abs-search/components/modals/CreditDetailsModal';
import {
  GraphModal,
} from '@/features/technical/abs-search/components/modals/GraphModal';
import { Account, Credit } from '@/features/technical/abs-search/types';

const PAGE_SIZE = 50;

export default function QRTransactionsPage() {
  const [startDate, setStartDate] = useState('2025-09-25T00:00');
  const [endDate, setEndDate] = useState('2025-10-01T23:59');
  const [type, setType] = useState<'usOnThem' | 'themOnUs' | 'loans'>('themOnUs');
  
  const [transactions, setTransactions] = useState<QRTransaction[]>([]);
  const [banks, setBanks] = useState<QRBank[]>([]);
  const [merchants, setMerchants] = useState<QRMerchant[]>([]);
  const [limit, setLimit] = useState<number | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showMerchantTranslator, setShowMerchantTranslator] = useState(false);
  const [merchantSearch, setMerchantSearch] = useState("");

  const [filters, setFilters] = useState({
    sender_name: '',
    sender_phone: '',
    merchant_code: '',
    terminal_code: '',
    status: 'all',
    amount: '',
  });

  // Loans state
  const [loanSearchValue, setLoanSearchValue] = useState("");
  const [selectTypeSearchLoan, setSelectTypeSearchLoan] = useState(TYPE_SEARCH_CLIENT?.[1]?.value || "");
  const [creditsData, setCreditsData] = useState<Credit[]>([]);
  const [userAccounts, setUserAccounts] = useState<Account[]>([]);
  const [isLoanSearching, setIsLoanSearching] = useState(false);
  
  // Modals state
  const [repayModalOpen, setRepayModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [graphModalOpen, setGraphModalOpen] = useState(false);
  const [selectedReferenceId, setSelectedReferenceId] = useState("");
  const [selectedCreditForRepay, setSelectedCreditForRepay] = useState<Credit | null>(null);

  const fetchData = useCallback(async () => {
    if (type === 'loans') return;
    setIsLoading(true);
    try {
      const data = await qrAgentService.getTransactions(type as any, startDate, endDate, 1, PAGE_SIZE);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить транзакции', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [type, startDate, endDate]);

  const fetchMetadata = useCallback(async () => {
    try {
      const [banksData, merchantsData, limitData] = await Promise.all([
        qrAgentService.getBanks(),
        qrAgentService.getMerchants(),
        qrAgentService.getLimit(),
      ]);
      setBanks(Array.isArray(banksData) ? banksData : []);
      setMerchants(Array.isArray(merchantsData) ? merchantsData : []);
      setLimit(limitData?.limit ?? null);
    } catch (err) {
      console.error('Metadata fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
    fetchData();
  }, [fetchMetadata, fetchData]);

  const filteredData = useMemo(() => {
    return transactions.filter((row) => {
      if (filters.status !== 'all' && row.status !== filters.status) return false;
      if (filters.amount && !String(row.amount).includes(filters.amount)) return false;
      
      if (type === 'usOnThem') {
        if (filters.sender_name && !row.sender_name?.toLowerCase().includes(filters.sender_name.toLowerCase())) return false;
        if (filters.sender_phone && !row.sender_phone?.includes(filters.sender_phone)) return false;
      } else if (type === 'themOnUs') {
        if (filters.merchant_code && !row.merchant_code?.includes(filters.merchant_code)) return false;
        if (filters.terminal_code && !row.terminal_code?.includes(filters.terminal_code)) return false;
      }
      return true;
    });
  }, [transactions, filters, type]);

  const totalSum = useMemo(() => {
    return filteredData.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  }, [filteredData]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await qrAgentService.exportTransactions(type as any, filteredData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR_Report_${type}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: 'Успешно', description: 'Файл успешно выгружен' });
    } catch (err) {
      toast({ title: 'Ошибка', description: 'Не удалось выгрузить файл', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSearchLoans = async () => {
    if (!loanSearchValue.trim()) {
      toast({ title: "Ошибка", description: "Введите данные для поиска", variant: "destructive" });
      return;
    }
    setIsLoanSearching(true);
    try {
      const isCodeSearch = selectTypeSearchLoan.includes('clientIndex=');
      let clientCode = loanSearchValue;

      if (!isCodeSearch) {
        const clients = await absService.searchClients(selectTypeSearchLoan, loanSearchValue);
        const firstClient = Array.isArray(clients) ? clients[0] : clients?.data?.[0] || clients;
        clientCode = firstClient?.client_code || firstClient?.ClientCode || firstClient?.code || firstClient?.Client?.Code;
      }

      if (!clientCode) {
        toast({ title: "Не найдено", description: "Клиент не найден", variant: "destructive" });
        setCreditsData([]);
        return;
      }

      const [credits, accounts] = await Promise.all([
        absService.getCredits(clientCode),
        absService.getAccounts(clientCode)
      ]);
      
      setCreditsData(Array.isArray(credits) ? credits : []);
      setUserAccounts(Array.isArray(accounts) ? accounts : []);
      
      if (credits.length === 0) {
        toast({ title: "Информация", description: "Кредиты не найдены" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Ошибка", description: "Ошибка при поиске", variant: "destructive" });
    } finally {
      setIsLoanSearching(false);
    }
  };

  const handleOpenDetails = (referenceId: string) => {
    setSelectedReferenceId(referenceId);
    setDetailsModalOpen(true);
  };

  const handleOpenGraph = (referenceId: string) => {
    setSelectedReferenceId(referenceId);
    setGraphModalOpen(true);
  };

  const handleOpenRepayModal = (credit: Credit) => {
    setSelectedCreditForRepay(credit);
    setRepayModalOpen(true);
  };

  const columns: ColumnDef<QRTransaction>[] = [
    { 
      accessorKey: 'id', 
      header: 'ID',
      cell: ({ row }) => <span className="text-xs font-mono">{row.original.id}</span>
    },
    ...(type === 'usOnThem' ? [
      { 
        accessorKey: 'sender_name', 
        header: 'ФИО',
        cell: ({ row }: any) => <span>{row.original.sender_name || '-'}</span>
      },
      { 
        accessorKey: 'sender_phone', 
        header: 'Телефон',
        cell: ({ row }: any) => <span className="font-mono">{row.original.sender_phone || '-'}</span>
      },
    ] : [
      { 
        id: 'merchant', 
        header: 'Мерчант',
        cell: ({ row }: any) => {
          const code = row.original.merchant_code || row.original.merchant_id;
          const merchant = merchants.find(m => String(m.code) === String(code));
          return <span>{merchant?.title || code || '-'}</span>;
        }
      },
      { 
        accessorKey: 'tx_id', 
        header: 'TX ID',
        cell: ({ row }: any) => <span className="text-xs font-mono">{row.original.tx_id || '-'}</span>
      },
    ]),
    { 
      accessorKey: 'description', 
      header: 'Описание',
      cell: ({ row }) => <span className="text-xs max-w-[200px] truncate block">{row.original.description || '-'}</span>
    },
    { 
      id: 'terminal', 
      header: type === 'themOnUs' ? 'Код терминала' : 'Номер в АРМ',
      cell: ({ row }) => <span>{type === 'themOnUs' ? row.original.terminal_code : row.original.trnId || '-'}</span>
    },
    { 
      accessorKey: 'status', 
      header: 'Статус',
      cell: ({ row }) => {
        const status = row.original.status;
        if (status === 'success') return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1"><CheckCircle2 className="size-3" /> Успешно</Badge>;
        if (status === 'process') return <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1"><Clock className="size-3" /> В процессе</Badge>;
        if (status === 'cancel') return <Badge className="bg-rose-50 text-rose-700 border-rose-200 gap-1"><XCircle className="size-3" /> Отменено</Badge>;
        return <Badge className="bg-slate-50 text-slate-700 border-slate-200 gap-1"><AlertCircle className="size-3" /> Ошибка</Badge>;
      }
    },
    { 
      id: 'bank_sender', 
      header: 'Банк отпр.',
      cell: ({ row }) => {
        const bankId = type === 'usOnThem' ? row.original.sender_bank : row.original.sender;
        const bank = banks.find(b => b.bankId === bankId || b.id === bankId);
        return <span className="text-xs">{bank?.bankName || `ID: ${bankId}`}</span>;
      }
    },
    { 
      accessorKey: 'amount', 
      header: 'Сумма',
      cell: ({ row }) => <span className="font-bold tabular-nums text-bank-red">{Number(row.original.amount).toLocaleString('ru-RU')} с.</span>
    },
    { 
      id: 'date', 
      header: 'Дата',
      cell: ({ row }) => {
        const d = type === 'usOnThem' ? row.original.created_at : row.original.creation_datetime;
        return <span className="text-xs text-muted-foreground">{d ? new Date(d).toLocaleString('ru-RU') : '-'}</span>;
      }
    },
  ];

  return (
    <PageContainer title="QR Транзакции" subtitle="Список операций по QR кодам">
      
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <Button 
            variant={type === 'themOnUs' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setType('themOnUs')}
            className={type === 'themOnUs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}
          >
            Наш QR — чужой клиент
          </Button>
          <Button 
            variant={type === 'usOnThem' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setType('usOnThem')}
            className={type === 'usOnThem' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}
          >
            Наш клиент — чужой QR
          </Button>
          <Button 
            variant={type === 'loans' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setType('loans')}
            className={type === 'loans' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}
          >
            Погашение кредитов
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {type !== 'loans' && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowChart(!showChart)} className="gap-2">
                <BarChart3 className="size-4" /> {showChart ? 'Скрыть график' : 'Показать график'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className={showFilters ? 'bg-bank-active text-bank-red border-bank-red' : 'gap-2'}>
                <Filter className="size-4" /> Фильтры
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowMerchantTranslator(!showMerchantTranslator)} className={showMerchantTranslator ? 'bg-bank-active text-bank-red border-bank-red' : 'gap-2'}>
                <Search className="size-4" /> Поиск мерчантов
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting || filteredData.length === 0} className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white border-none">
                <Download className="size-4" /> {isExporting ? 'Выгрузка...' : 'Выгрузка QR'}
              </Button>
            </>
          )}
        </div>
      </div>

      {type !== 'loans' && showChart && (
        <div className="mb-6">
          <QRStatistics startDate={startDate} endDate={endDate} />
        </div>
      )}

      {showMerchantTranslator && type !== 'loans' && (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6 space-y-4 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Поиск мерчант кодов</h3>
          <div className="flex gap-2">
            <Input 
              placeholder="Введите код или название мерчанта..." 
              value={merchantSearch}
              onChange={(e) => setMerchantSearch(e.target.value)}
              className="max-w-md bg-white"
            />
            {merchantSearch && (
              <Button variant="ghost" size="sm" onClick={() => setMerchantSearch("")} className="text-bank-red">Очистить</Button>
            )}
          </div>
          {merchantSearch && (
            <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Код</th>
                    <th className="px-4 py-2 text-left font-semibold">Название</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {merchants
                    .filter(m => 
                      String(m.code).includes(merchantSearch) || 
                      m.title.toLowerCase().includes(merchantSearch.toLowerCase())
                    )
                    .map(m => (
                      <tr key={m.ID} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-mono">{m.code}</td>
                        <td className="px-4 py-2">{m.title}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Summary Row */}
      {type !== 'loans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Баланс Активбанк</span>
            <span className="text-2xl font-bold">{limit !== null ? `${limit.toLocaleString('ru-RU')} с.` : '—'}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Сумма операций</span>
            <span className="text-2xl font-bold text-bank-red">{totalSum.toLocaleString('ru-RU')} с.</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Период поиска</span>
            <div className="flex items-center gap-2 mt-1">
              <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-8 text-xs w-[170px]" />
              <span className="text-muted-foreground">—</span>
              <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-8 text-xs w-[170px]" />
            </div>
          </div>
        </div>
      )}

      {showFilters && type !== 'loans' && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
          {type === 'usOnThem' ? (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">ФИО</Label>
                <Input size="sm" placeholder="Поиск по имени" value={filters.sender_name} onChange={(e) => setFilters(p => ({ ...p, sender_name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Телефон</Label>
                <Input size="sm" placeholder="Поиск по телефону" value={filters.sender_phone} onChange={(e) => setFilters(p => ({ ...p, sender_phone: e.target.value }))} />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">Код мерчанта</Label>
                <Input size="sm" placeholder="Код мерчанта" value={filters.merchant_code} onChange={(e) => setFilters(p => ({ ...p, merchant_code: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Код терминала</Label>
                <Input size="sm" placeholder="Код терминала" value={filters.terminal_code} onChange={(e) => setFilters(p => ({ ...p, terminal_code: e.target.value }))} />
              </div>
            </>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">Сумма</Label>
            <Input size="sm" placeholder="Поиск по сумме" value={filters.amount} onChange={(e) => setFilters(p => ({ ...p, amount: e.target.value }))} />
          </div>
          <div className="flex items-end">
            <Button variant="ghost" size="sm" onClick={() => setFilters({ sender_name: '', sender_phone: '', merchant_code: '', terminal_code: '', status: 'all', amount: '' })} className="text-bank-red">
              Очистить фильтры
            </Button>
          </div>
        </div>
      )}

      {type === 'loans' ? (
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
             <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Поиск клиента для погашения</h3>
             <div className="flex flex-wrap gap-4 items-end">
                <div className="w-64 space-y-1.5">
                  <Label className="text-xs">Тип поиска</Label>
                  <Select value={selectTypeSearchLoan} onValueChange={setSelectTypeSearchLoan}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      {(TYPE_SEARCH_CLIENT || []).map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[300px] space-y-1.5">
                  <Label className="text-xs">Данные для поиска</Label>
                  <Input 
                    placeholder="Введите данные..." 
                    value={loanSearchValue} 
                    onChange={(e) => setLoanSearchValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchLoans()}
                    className="bg-white"
                  />
                </div>
                <Button onClick={handleSearchLoans} disabled={isLoanSearching} className="bg-bank-red text-white hover:bg-bank-red/90 h-10 px-8">
                  {isLoanSearching ? 'Поиск...' : 'Найти'}
                </Button>
             </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">№ Договора</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Статус</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Сумма</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Дата</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Продукт</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {creditsData.length > 0 ? (
                  creditsData.map((credit, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{credit.contractNumber}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={credit.statusName?.includes('Открыт') ? 'text-emerald-600 border-emerald-100 bg-emerald-50/30' : ''}>
                          {credit.statusName}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-bold">{credit.amount} {credit.currency}</td>
                      <td className="px-4 py-3 text-muted-foreground">{credit.documentDate}</td>
                      <td className="px-4 py-3 text-xs">{credit.productName}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                           <Button size="sm" variant="outline" className="h-8 text-[11px] gap-1" onClick={() => credit.referenceId && handleOpenGraph(credit.referenceId)}>
                             <BarChart3 className="size-3" /> График
                           </Button>
                           <Button size="sm" variant="outline" className="h-8 text-[11px] gap-1 border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => credit.referenceId && handleOpenDetails(credit.referenceId)}>
                             <FileText className="size-3" /> Детали
                           </Button>
                           <Button size="sm" className="h-8 text-[11px] gap-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleOpenRepayModal(credit)}>
                             <History className="size-3" /> Погасить
                           </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      {isLoanSearching ? 'Выполняется поиск...' : 'Результаты поиска появятся здесь'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          isLoading={isLoading}
          pageSize={PAGE_SIZE}
          emptyMessage="Нет данных для отображения"
        />
      )}

      {/* Modals */}
      <RepayModal
        credit={selectedCreditForRepay}
        accounts={userAccounts}
        onClose={() => setRepayModalOpen(false)}
        onRefresh={handleSearchLoans}
      />

      <CreditDetailsModal
        referenceId={detailsModalOpen ? selectedReferenceId : null}
        onClose={() => setDetailsModalOpen(false)}
      />

      <GraphModal
        referenceId={graphModalOpen ? selectedReferenceId : null}
        onClose={() => {
          setGraphModalOpen(false);
          setSelectedReferenceId("");
        }}
      />

    </PageContainer>
  );
}
