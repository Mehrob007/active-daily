'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { DataTable } from '@/components/banking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Download,
  Filter,
  RefreshCw,
  X,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { processingService } from '../services/processing-service';
import { ProcessingTransaction } from '../types';
import { toast } from '@/hooks/use-toast';
import { ColumnDef } from '@tanstack/react-table';

const searchOptions = [
  { value: 'cardId', label: 'Поиск по идентификатору карты' },
  { value: 'atmId', label: 'Поиск по номеру терминала' },
  { value: 'utrnno', label: 'Поиск по номеру операции (UTRNNO)' },
  { value: 'transactionType', label: 'Поиск по типу транзакции' },
  { value: 'amount', label: 'Поиск по сумме операции' },
  { value: 'reversal', label: 'Поиск по статусу отмены' },
  { value: 'mcc', label: 'Поиск по MCC коду' },
  { value: 'cardBinSearch', label: 'Поиск по BIN карты и типу транзакции' },
];

export default function ProcessingTransactionsPage() {
  const [searchType, setSearchType] = useState('cardId');
  const [filters, setFilters] = useState<any>({
    cardId: '',
    atmId: '',
    utrnno: '',
    transactionType: '',
    amountFrom: '',
    amountTo: '',
    reversal: '',
    mcc: '',
    cardBin: '',
    searchTransactionType: '',
    searchDate: new Date().toISOString().split('T')[0],
    fromTime: '',
    toTime: '',
    fromDate: '',
    toDate: '',
  });

  const [transactions, setTransactions] = useState<ProcessingTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({ USD: 1, EUR: 1 });

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    setFilters((prev: any) => ({
      ...prev,
      fromDate: formatDate(thirtyDaysAgo),
      toDate: formatDate(today),
    }));

    processingService.fetchConversionRates().then((rates) => {
      const usd = rates.find((r: any) => r.currencyFrom === 'USD' && r.currencyTo === 'TJS' && r.type === 'from')?.amountTo || 1;
      const eur = rates.find((r: any) => r.currencyFrom === 'EUR' && r.currencyTo === 'TJS' && r.type === 'from')?.amountTo || 1;
      setExchangeRates({ USD: usd, EUR: eur });
    }).catch(console.error);
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (searchType === 'cardId') params.cardId = filters.cardId;
      if (searchType === 'atmId') params.atmId = filters.atmId;
      if (searchType === 'utrnno') params.utrnno = filters.utrnno;
      if (searchType === 'transactionType') params.transactionType = filters.transactionType;
      if (searchType === 'amount') {
        params.fromAmount = filters.amountFrom;
        params.toAmount = filters.amountTo;
      }
      if (searchType === 'reversal') params.reversal = filters.reversal;
      if (searchType === 'mcc') params.mcc = filters.mcc;
      if (searchType === 'cardBinSearch') {
        params.cardBin = filters.cardBin;
        params.transactionType = filters.searchTransactionType;
        params.date = filters.searchDate;
        params.fromTime = filters.fromTime;
        params.toTime = filters.toTime;
      }

      if (searchType !== 'utrnno' && searchType !== 'cardBinSearch') {
        params.fromDate = filters.fromDate;
        params.toDate = filters.toDate;
      }

      const data = await processingService.fetchTransactions(searchType, params);
      setTransactions(Array.isArray(data) ? data : []);
      if (data.length === 0) {
        toast({ title: 'Информация', description: 'Транзакции не найдены' });
      }
    } catch (err: any) {
      toast({ title: 'Ошибка поиска', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters((prev: any) => ({
      ...prev,
      cardId: '',
      atmId: '',
      utrnno: '',
      transactionType: '',
      amountFrom: '',
      amountTo: '',
      reversal: '',
      mcc: '',
      cardBin: '',
      searchTransactionType: '',
    }));
    setTransactions([]);
  };

  const columns: ColumnDef<ProcessingTransaction>[] = [
    {
      id: 'dateTime',
      header: 'Дата/Время',
      cell: ({ row }) => (
        <div className="flex flex-col text-[11px] font-mono text-muted-foreground">
          <span className="font-bold text-foreground">{row.original.localTransactionDate}</span>
          <span>{row.original.localTransactionTime}</span>
        </div>
      )
    },
    {
      accessorKey: 'responseDescription',
      header: 'Статус',
      cell: ({ row }) => {
        const desc = row.original.responseDescription || '';
        const code = row.original.responseCode;
        const rev = row.original.reversal;
        const isSuccess = code === '000' && (rev === '0' || rev === 0);
        return (
          <Badge variant="outline" className={`text-[10px] gap-1 px-1.5 ${isSuccess ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-rose-200 text-rose-700 bg-rose-50'}`}>
            {isSuccess ? <CheckCircle2 className="size-3" /> : <AlertCircle className="size-3" />}
            {desc}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'cardNumber',
      header: 'Карта',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.cardNumber}</span>
    },
    {
      accessorKey: 'transactionTypeName',
      header: 'Тип операции',
      cell: ({ row }) => <span className="text-[11px] font-medium leading-tight">{row.original.transactionTypeName}</span>
    },
    {
      id: 'amountOrig',
      header: 'Сумма (Ориг.)',
      cell: ({ row }) => {
        const amt = Number(row.original.amount) / 100;
        const curr = row.original.currency === '972' ? 'TJS' : row.original.currency === '840' ? 'USD' : row.original.currency === '978' ? 'EUR' : row.original.currency;
        return <span className="font-bold tabular-nums text-bank-red">{amt.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} {curr}</span>;
      }
    },
    {
      id: 'amountCard',
      header: 'Сумма (Карта)',
      cell: ({ row }) => {
        const amt = Number(row.original.conamt) / 100;
        const curr = row.original.conCurrency === '972' ? 'TJS' : row.original.conCurrency === '840' ? 'USD' : row.original.conCurrency === '978' ? 'EUR' : row.original.conCurrency;
        return <span className="font-mono text-[11px]">{amt.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} {curr}</span>;
      }
    },
    {
      id: 'amountTjs',
      header: 'В нац. вал.',
      cell: ({ row }) => {
        const rate = row.original.conCurrency === '840' || row.original.conCurrency === 840 ? exchangeRates.USD : row.original.conCurrency === '978' || row.original.conCurrency === 978 ? exchangeRates.EUR : 1;
        const amtTjs = (Number(row.original.conamt) / 100) * rate;
        return <span className="font-bold tabular-nums text-emerald-600">{amtTjs.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} TJS</span>;
      }
    },
    {
      accessorKey: 'utrnno',
      header: 'UTRNNO',
      cell: ({ row }) => <span className="text-[10px] font-mono">{row.original.utrnno}</span>
    },
    {
      accessorKey: 'terminalId',
      header: 'Terminal ID',
      cell: ({ row }) => <span className="text-[10px] font-mono">{row.original.terminalId}</span>
    }
  ];

  return (
    <PageContainer title="Транзакции процессинга" subtitle="Глубокий поиск по операциям в ПЦ">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-bold text-slate-500">Тип поиска</Label>
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {searchOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {searchType === 'cardId' && (
            <div className="space-y-1.5 lg:col-span-1">
              <Label className="text-xs uppercase font-bold text-slate-500">ID Карты</Label>
              <Input placeholder="ID карты (через запятую для нескольких)" value={filters.cardId} onChange={e => setFilters({...filters, cardId: e.target.value})} className="h-10 font-mono" />
            </div>
          )}

          {searchType === 'atmId' && (
            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-bold text-slate-500">ID АТМ/Терминала</Label>
              <Input placeholder="Напр. 00000014" value={filters.atmId} onChange={e => setFilters({...filters, atmId: e.target.value})} className="h-10" />
            </div>
          )}

          {searchType === 'utrnno' && (
            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-bold text-slate-500">UTRNNO</Label>
              <Input placeholder="Напр. 353403802" value={filters.utrnno} onChange={e => setFilters({...filters, utrnno: e.target.value})} className="h-10 font-mono" />
            </div>
          )}

          {searchType === 'transactionType' && (
            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-bold text-slate-500">Код типа транзакции</Label>
              <Input placeholder="Напр. 774" value={filters.transactionType} onChange={e => setFilters({...filters, transactionType: e.target.value})} className="h-10" />
            </div>
          )}

          {searchType === 'amount' && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-bold text-slate-500">Сумма от</Label>
                <Input type="number" placeholder="0" value={filters.amountFrom} onChange={e => setFilters({...filters, amountFrom: e.target.value})} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-bold text-slate-500">Сумма до</Label>
                <Input type="number" placeholder="10000" value={filters.amountTo} onChange={e => setFilters({...filters, amountTo: e.target.value})} className="h-10" />
              </div>
            </>
          )}

          {searchType === 'reversal' && (
            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-bold text-slate-500">Статус отмены</Label>
              <Select value={filters.reversal} onValueChange={v => setFilters({...filters, reversal: v})}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Без отмены</SelectItem>
                  <SelectItem value="1">Только отмены</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {searchType === 'mcc' && (
            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-bold text-slate-500">MCC Код</Label>
              <Input placeholder="Напр. 6011" value={filters.mcc} onChange={e => setFilters({...filters, mcc: e.target.value})} className="h-10" />
            </div>
          )}

          {searchType === 'cardBinSearch' && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-bold text-slate-500">BIN (6 цифр)</Label>
                <Input placeholder="Напр. 478687" maxLength={6} value={filters.cardBin} onChange={e => setFilters({...filters, cardBin: e.target.value})} className="h-10 font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-bold text-slate-500">Тип транзакции</Label>
                <Input placeholder="Напр. 774" value={filters.searchTransactionType} onChange={e => setFilters({...filters, searchTransactionType: e.target.value})} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-bold text-slate-500">Дата</Label>
                <Input type="date" value={filters.searchDate} onChange={e => setFilters({...filters, searchDate: e.target.value})} className="h-10" />
              </div>
              <div className="space-y-1.5 flex gap-2">
                <div className="flex-1 space-y-1.5">
                   <Label className="text-xs uppercase font-bold text-slate-500">С</Label>
                   <Input type="time" value={filters.fromTime} onChange={e => setFilters({...filters, fromTime: e.target.value})} className="h-10" />
                </div>
                <div className="flex-1 space-y-1.5">
                   <Label className="text-xs uppercase font-bold text-slate-500">По</Label>
                   <Input type="time" value={filters.toTime} onChange={e => setFilters({...filters, toTime: e.target.value})} className="h-10" />
                </div>
              </div>
            </>
          )}

          {searchType !== 'utrnno' && searchType !== 'cardBinSearch' && (
            <div className="space-y-1.5 lg:col-span-2 flex gap-3">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs uppercase font-bold text-slate-500">Дата с</Label>
                <Input type="date" value={filters.fromDate} onChange={e => setFilters({...filters, fromDate: e.target.value})} className="h-10" />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs uppercase font-bold text-slate-500">Дата по</Label>
                <Input type="date" value={filters.toDate} onChange={e => setFilters({...filters, toDate: e.target.value})} className="h-10" />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={clearFilters} disabled={isLoading} className="text-slate-500">
            <X className="size-4 mr-2" /> Очистить
          </Button>
          <Button onClick={handleSearch} disabled={isLoading} className="bg-bank-red hover:bg-bank-red/90 text-white px-8 h-12 shadow-lg shadow-bank-red/20">
            {isLoading ? <RefreshCw className="size-5 animate-spin mr-2" /> : <Search className="size-5 mr-2" />}
            Найти транзакции
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={transactions}
        isLoading={isLoading}
        pageSize={20}
        emptyMessage="Выполните поиск для отображения результатов"
      />
    </PageContainer>
  );
}
