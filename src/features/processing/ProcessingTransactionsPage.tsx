'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Download, FilterX, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/banking/data-table';

const SEARCH_TYPES = [
  { value: 'cardId', label: 'Поиск по ID карты' },
  { value: 'atmId', label: 'Поиск по номеру терминала (ATM)' },
  { value: 'utrnno', label: 'Поиск по UTRNNO (номер операции)' },
  { value: 'transactionType', label: 'Поиск по типу транзакции' },
  { value: 'amount', label: 'Поиск по сумме операции' },
  { value: 'reversal', label: 'Поиск по статусу отмены' },
  { value: 'mcc', label: 'Поиск по MCC коду' },
  { value: 'cardBinSearch', label: 'Поиск по BIN карты' },
];

export function ProcessingTransactionsPage() {
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('cardId');
  const [searchValue, setSearchValue] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);

  // Для поиска по сумме
  const [amountFrom, setAmountFrom] = useState('');
  const [amountTo, setAmountTo] = useState('');

  // Для поиска по времени/датам
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const handleSearch = async () => {
    if (searchType !== 'amount' && !searchValue) {
      toast.error('Введите данные для поиска');
      return;
    }

    setLoading(true);
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData = [
        {
          id: 'TXN-12345',
          date: '2026-06-26 14:30:00',
          status: 'Успешно',
          statusType: 'success',
          cardNumber: '4314 **** **** 1234',
          transactionTypeName: 'Оплата товаров и услуг',
          amount: '150.00',
          currency: 'TJS',
          terminalId: 'TERM001',
          atmId: 'ATM-992',
          mcc: '5411',
          utrnno: '891023912301'
        },
        {
          id: 'TXN-12346',
          date: '2026-06-26 15:10:00',
          status: 'Возврат',
          statusType: 'warning',
          cardNumber: '5048 **** **** 5678',
          transactionTypeName: 'Снятие наличных',
          amount: '-500.00',
          currency: 'TJS',
          terminalId: 'TERM002',
          atmId: 'ATM-445',
          mcc: '6011',
          utrnno: '891023912302'
        }
      ];
      
      setTransactions(mockData);
      toast.success(`Найдено ${mockData.length} транзакций`);
    } catch (error) {
      toast.error('Ошибка при поиске транзакций');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchValue('');
    setAmountFrom('');
    setAmountTo('');
    setFromDate('');
    setToDate('');
    setTransactions([]);
  };

  const renderSearchInput = () => {
    if (searchType === 'amount') {
      return (
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <Input 
            type="number" 
            placeholder="Сумма от" 
            value={amountFrom} 
            onChange={(e) => setAmountFrom(e.target.value)} 
          />
          <Input 
            type="number" 
            placeholder="Сумма до" 
            value={amountTo} 
            onChange={(e) => setAmountTo(e.target.value)} 
          />
        </div>
      );
    }
    
    return (
      <Input 
        placeholder="Введите значение для поиска..." 
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        className="flex-1"
      />
    );
  };

  return (
    <PageContainer
      title="Транзакции ПЦ"
      subtitle="Просмотр и поиск транзакций процессингового центра"
    >
      <div className="flex flex-col gap-6">
        <Card className="border-t-4 border-t-primary shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>Фильтры поиска</CardTitle>
            <CardDescription>Укажите параметры для поиска транзакций в ПЦ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={searchType} onValueChange={(v) => { setSearchType(v); clearFilters(); }}>
                <SelectTrigger className="w-full md:w-[280px]">
                  <SelectValue placeholder="Тип поиска" />
                </SelectTrigger>
                <SelectContent>
                  {SEARCH_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {renderSearchInput()}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex gap-2 items-center">
                <CalendarIcon className="h-4 w-4 text-muted-foreground hidden sm:block" />
                <Input 
                  type="date" 
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full"
                />
                <span className="text-muted-foreground">-</span>
                <Input 
                  type="date" 
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" onClick={clearFilters} className="w-full md:w-auto">
                  <FilterX className="mr-2 h-4 w-4" /> Очистить
                </Button>
                <Button onClick={handleSearch} disabled={loading} className="w-full md:w-auto">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  Поиск
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {transactions.length > 0 && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Результаты ({transactions.length})</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Экспорт (Excel)
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="h-10 px-4 text-left font-medium">Дата и время</th>
                      <th className="h-10 px-4 text-left font-medium">Статус</th>
                      <th className="h-10 px-4 text-left font-medium">Карта</th>
                      <th className="h-10 px-4 text-left font-medium">Тип операции</th>
                      <th className="h-10 px-4 text-right font-medium">Сумма</th>
                      <th className="h-10 px-4 text-left font-medium">UTRNNO</th>
                      <th className="h-10 px-4 text-left font-medium">Терминал</th>
                      <th className="h-10 px-4 text-left font-medium">MCC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => (
                      <tr key={txn.id} className="border-t transition-colors hover:bg-muted/30">
                        <td className="p-4 align-middle whitespace-nowrap text-xs">
                          {txn.date}
                        </td>
                        <td className="p-4 align-middle">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                            ${txn.statusType === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                              txn.statusType === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="p-4 align-middle whitespace-nowrap font-mono">
                          {txn.cardNumber}
                        </td>
                        <td className="p-4 align-middle max-w-[200px] truncate" title={txn.transactionTypeName}>
                          {txn.transactionTypeName}
                        </td>
                        <td className="p-4 align-middle text-right font-bold whitespace-nowrap">
                          <span className={Number(txn.amount) < 0 ? "text-red-500" : "text-green-500"}>
                            {txn.amount} {txn.currency}
                          </span>
                        </td>
                        <td className="p-4 align-middle font-mono text-xs">
                          {txn.utrnno}
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex flex-col">
                            <span>{txn.terminalId}</span>
                            <span className="text-xs text-muted-foreground">{txn.atmId}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          {txn.mcc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
