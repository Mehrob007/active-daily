'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Download, RefreshCw, FileSpreadsheet, Search } from 'lucide-react';

import {
  getCustomsPayments,
  paySingleCustoms,
  exportCustomsExcel,
  getAbsStatement,
  getCustomsBalance,
  CustomsTransaction,
} from '../services/customs-service';
import { getPaymentStatus, isWorkingHours } from '../utils/customs-utils';

import { CustomsDataTable } from './components/CustomsDataTable';
import { AbsStatementTable } from './components/AbsStatementTable';

export function CustomsPayPage() {
  const [data, setData] = useState<CustomsTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [statementData, setStatementData] = useState<any[]>([]);
  const [statementLoading, setStatementLoading] = useState(false);
  const [absStartDate, setAbsStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [absEndDate, setAbsEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [balance, setBalance] = useState<number | null>(null);

  const [filters, setFilters] = useState({
    id: '',
    docId: '',
    transactionId: '',
    payerName: '',
    recName: '',
    status: '',
    payedAt: '',
    amount: '',
  });

  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);
  
  const [payingIds, setPayingIds] = useState<Set<string | number>>(new Set());
  const [showSingleConfirm, setShowSingleConfirm] = useState(false);
  const [showMultiConfirm, setShowMultiConfirm] = useState(false);
  const [singleTxToPay, setSingleTxToPay] = useState<CustomsTransaction | null>(null);
  const [multiTxToPay, setMultiTxToPay] = useState<CustomsTransaction[]>([]);

  const loadBalance = async () => {
    try {
      const res = await getCustomsBalance();
      if (res && typeof res.balance === 'number') {
        setBalance(res.balance);
      }
    } catch (err) {
      console.error('Failed to load balance', err);
    }
  };

  const fetchEqms = async () => {
    try {
      setLoading(true);
      const res = await getCustomsPayments(startDate, endDate);
      setData(res);
      toast.success(`Загружено ${res.length} записей`);
      loadBalance();
    } catch (err: any) {
      toast.error('Ошибка загрузки данных. Проверьте сервер.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatement = async () => {
    try {
      setStatementLoading(true);
      const account = '26202972381810638175';
      const res = await getAbsStatement(absStartDate, absEndDate, account);
      setStatementData(res);
      toast.success(`Загружена выписка (${res.length} дней)`);
    } catch (err: any) {
      toast.error('Ошибка загрузки выписки. Проверьте сервер.');
      setStatementData([]);
    } finally {
      setStatementLoading(false);
    }
  };

  useEffect(() => {
    fetchEqms();
  }, [startDate, endDate]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        
        if (key === 'payedAt' && value === 'paid') return getPaymentStatus(row) !== 'pending';
        if (key === 'payedAt' && value === 'not_paid') return getPaymentStatus(row) === 'pending';
        if (key === 'status') return String(row.status || '').toLowerCase() === value.toLowerCase();

        const rowValue = row[key];
        if (rowValue == null) return false;
        if (typeof rowValue === 'number') return String(rowValue).includes(value);
        if (typeof rowValue === 'boolean') return String(rowValue).toLowerCase() === value.toLowerCase();
        if (typeof rowValue === 'string') return rowValue.toLowerCase().includes(String(value).toLowerCase());
        
        return false;
      });
    });
  }, [data, filters]);

  const sortedData = useMemo(() => {
    const arr = [...filteredData];
    arr.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      
      const cmp = typeof aVal === 'number' && typeof bVal === 'number' 
        ? aVal - bVal 
        : String(aVal).localeCompare(String(bVal), 'ru', { numeric: true });
      
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filteredData, sortField, sortDirection]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(sortedData.map(r => r.id));
    } else {
      setSelectedRows([]);
    }
  };

  const toggleSelect = (id: string | number, checked: boolean) => {
    if (checked) {
      setSelectedRows(prev => [...prev, id]);
    } else {
      setSelectedRows(prev => prev.filter(r => r !== id));
    }
  };

  const selectAllUnpaid = () => {
    const ids = sortedData
      .filter(row => 
        (getPaymentStatus(row) === 'pending' || row.statusABS !== 'Оплачено в АБС') && 
        String(row.status || '').toLowerCase() === 'success'
      )
      .map(r => r.id);
    setSelectedRows(ids);
  };

  const selectAllPaid = () => {
    const ids = sortedData
      .filter(row => 
        (getPaymentStatus(row) !== 'pending' && row.statusABS === 'Оплачено в АБС') && 
        String(row.status || '').toLowerCase() === 'success'
      )
      .map(r => r.id);
    setSelectedRows(ids);
  };

  const handlePaySingleClick = (tx: CustomsTransaction) => {
    const paymentStatus = getPaymentStatus(tx);
    const absStatus = tx.statusABS || 'Ожидает проверки';

    if (absStatus === 'Оплачено в АБС') {
      if (paymentStatus === 'already_paid') {
        toast.warning('Таможня уже оплачена ранее');
        return;
      }
      if (paymentStatus === 'paid') {
        toast.info('Оплата уже была отправлена (статус Success)');
        return;
      }
    }

    if (absStatus === 'Ожидает проверки' && paymentStatus === 'already_paid') {
      toast.warning('Оплата уже отправлена и ожидает подтверждения от АБС. Пожалуйста, подождите.');
      return;
    }

    setSingleTxToPay(tx);
    setShowSingleConfirm(true);
  };

  const handlePaySingleConfirm = async () => {
    if (!singleTxToPay) return;
    
    setShowSingleConfirm(false);
    const tx = singleTxToPay;
    setSingleTxToPay(null);
    setPayingIds(prev => new Set(prev).add(tx.id));

    try {
      await processPaymentWithRetry(tx, 0);
      toast.success('Оплата успешно отправлена! Ожидаем подтверждения...');
      setTimeout(fetchEqms, 1000);
    } catch (err: any) {
      const errMsg = err?.message || '';
      const isAlreadyPaid =
        errMsg.toLowerCase().includes('уже оплачена') ||
        errMsg.toLowerCase().includes('already_paid') ||
        errMsg.toLowerCase().includes('already paid');

      if (isAlreadyPaid) {
        toast.warning('Оплата уже была проведена или находится в обработке. Обновите страницу для проверки статуса.');
        setTimeout(fetchEqms, 1500);
      } else {
        toast.error(`Платеж с ID ${tx.id} завершился с ошибкой: ${errMsg}`);
      }
    } finally {
      setPayingIds(prev => {
        const next = new Set(prev);
        next.delete(tx.id);
        return next;
      });
    }
  };

  const processPaymentWithRetry = async (transaction: CustomsTransaction, retryCount = 0): Promise<any> => {
    const maxRetries = 3;
    const retryDelay = 2000;

    try {
      return await paySingleCustoms(transaction);
    } catch (err: any) {
      if (retryCount >= maxRetries || !isWorkingHours()) {
        throw err;
      }
      toast.warning(`Платеж ID ${transaction.id}: ошибка "${err.message}". Попытка ${retryCount + 1} из ${maxRetries}...`);
      await new Promise(res => setTimeout(res, retryDelay));
      return await processPaymentWithRetry(transaction, retryCount + 1);
    }
  };

  const handlePayMultiConfirm = async () => {
    setShowMultiConfirm(false);
    const toPay = multiTxToPay;
    setMultiTxToPay([]);
    
    setPayingIds(prev => new Set([...prev, ...toPay.map(t => t.id)]));
    
    let successes = 0;
    const fails = [];
    const batchSize = 150;
    const delayMs = 10000;

    try {
      for (let i = 0; i < toPay.length; i += batchSize) {
        const batch = toPay.slice(i, i + batchSize);
        const promises = batch.map(async (tx) => {
          try {
            await processPaymentWithRetry(tx, 0);
            successes++;
          } catch (err: any) {
            fails.push({ id: tx.id, error: err.message });
          }
        });
        await Promise.all(promises);
        if (i + batchSize < toPay.length) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
      
      const msg = `Успешно оплачено: ${successes}. Ошибок: ${fails.length}.`;
      if (fails.length === 0) toast.success(msg);
      else toast.warning(msg);
      
      setTimeout(fetchEqms, 1000);
    } catch (err) {
      toast.error('Критическая ошибка во время массовой оплаты');
    } finally {
      setPayingIds(prev => {
        const next = new Set(prev);
        toPay.forEach(t => next.delete(t.id));
        return next;
      });
    }
  };

  const triggerPaySelected = () => {
    const toPay = sortedData.filter(
      (row) =>
        selectedRows.includes(row.id) &&
        (getPaymentStatus(row) === 'pending' || row.statusABS !== 'Оплачено в АБС')
    );

    if (toPay.length === 0) {
      toast.warning('Нет выбранных неоплаченных записей для оплаты');
      return;
    }

    const alreadySentOrPaid = toPay.filter(
      (row) =>
        row.statusABS === 'Оплачено в АБС' ||
        row.statusABS === 'Ожидает проверки'
    );
    if (alreadySentOrPaid.length > 0) {
      toast.warning(
        `Среди выбранных записей есть ${alreadySentOrPaid.length} со статусом АБС "Оплачено в АБС" или "Ожидает проверки". Они будут пропущены.`
      );
    }

    const filteredToPay = toPay.filter(
      (row) =>
        row.statusABS !== 'Оплачено в АБС' &&
        row.statusABS !== 'Ожидает проверки'
    );

    if (filteredToPay.length === 0) {
      toast.info('Все выбранные записи уже отправлены в АБС или оплачены.');
      return;
    }

    setMultiTxToPay(filteredToPay);
    setShowMultiConfirm(true);
  };

  const handleExport = async () => {
    const selectedTxs = sortedData.filter(row => selectedRows.includes(row.id));
    if (selectedTxs.length === 0) {
      toast.error('Выберите хотя бы одну запись для выгрузки');
      return;
    }

    try {
      const allSelected = selectedRows.length === sortedData.length && sortedData.length > 0;
      const todayFormatted = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const filename = allSelected ? `EQMS_Report_${startDate}_to_${endDate}.xlsx` : `EQMS_Report_${todayFormatted}.xlsx`;
      
      await exportCustomsExcel(selectedTxs, filename);
      toast.success(`Файл успешно выгружен (${selectedTxs.length} записей)`);
      setSelectedRows([]);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const totalPaid = useMemo(() => sortedData.filter((row) => getPaymentStatus(row) !== 'pending').length, [sortedData]);
  const totalAmountSelected = useMemo(() => {
    return sortedData.filter(row => selectedRows.includes(row.id)).reduce((sum, row) => sum + (row.amount || 0), 0);
  }, [sortedData, selectedRows]);

  const flatStatementData = useMemo(() => {
    return statementData.flatMap((day) =>
      day.Transactions.map((tx: any) => ({
        ...tx,
        doper: day.DOPER,
        kurs: day.Kurs,
        sumBalOut: day.SumBalOut,
        sumMovD: day.SumMovD,
        sumMovC: day.SumMovC,
        sumMovDN: day.SumMovDN,
        sumMovCN: day.SumMovCN,
        transactionsCount: day.TransactionsCount,
      }))
    );
  }, [statementData]);

  return (
    <PageContainer title="Агент по таможне" description="Просмотр и оплата таможни">
      
      <Tabs defaultValue="eqms" className="mt-6 w-full">
        <TabsList className="mb-6 w-full max-w-md grid grid-cols-2">
          <TabsTrigger value="eqms">Таможенные платежи (EQMS)</TabsTrigger>
          <TabsTrigger value="statement">Выписка из АБС</TabsTrigger>
        </TabsList>
        
        <TabsContent value="eqms" className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <CardTitle className="text-lg font-medium text-slate-800">Список платежей</CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex items-center">
                    <span className="text-sm text-slate-500 mr-2">С</span>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40 h-8" />
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-slate-500 mr-2">По</span>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40 h-8" />
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchEqms} disabled={loading} className="h-8">
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Обновить
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <div className="flex space-x-4 text-sm bg-white p-2 rounded-md border border-slate-200 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs">Выбрано</span>
                    <strong className="text-slate-800">{selectedRows.length}</strong>
                  </div>
                  <div className="w-px bg-slate-200"></div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs">Оплачено всего</span>
                    <strong className="text-emerald-600">{totalPaid}</strong>
                  </div>
                  <div className="w-px bg-slate-200"></div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs">Сумма выбранных</span>
                    <strong className="text-primary">{totalAmountSelected.toLocaleString('ru-RU')} С</strong>
                  </div>
                  {balance !== null && (
                    <>
                      <div className="w-px bg-slate-200"></div>
                      <div className="flex flex-col">
                        <span className="text-slate-500 text-xs">Доступный баланс</span>
                        <strong className="text-emerald-600">{balance.toLocaleString('ru-RU')} С</strong>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row justify-between mb-6 space-y-4 lg:space-y-0">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={selectAllUnpaid} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200">
                    Все неоплаченные
                  </Button>
                  <Button variant="outline" onClick={selectAllPaid} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200">
                    Все оплаченные
                  </Button>
                  <Button variant="secondary" onClick={() => setSelectedRows([])} disabled={selectedRows.length === 0}>
                    Снять выделение
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={handleExport} disabled={selectedRows.length === 0}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Выгрузка EQMS
                  </Button>
                  <Button onClick={triggerPaySelected} disabled={selectedRows.length === 0 || payingIds.size > 0} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Download className="mr-2 h-4 w-4 rotate-180" /> Оплатить всё ({selectedRows.length})
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center font-medium text-slate-700 mb-2 col-span-2 md:col-span-4">
                  <Search className="mr-2 h-4 w-4" /> Фильтры поиска
                </div>
                <Input placeholder="ID" value={filters.id} onChange={(e) => handleFilterChange('id', e.target.value)} />
                <Input placeholder="Doc ID" value={filters.docId} onChange={(e) => handleFilterChange('docId', e.target.value)} />
                <Input placeholder="Transaction ID" value={filters.transactionId} onChange={(e) => handleFilterChange('transactionId', e.target.value)} />
                <Input placeholder="Payer Name" value={filters.payerName} onChange={(e) => handleFilterChange('payerName', e.target.value)} />
                <Input placeholder="Receiver Name" value={filters.recName} onChange={(e) => handleFilterChange('recName', e.target.value)} />
                <Input type="number" placeholder="Amount" value={filters.amount} onChange={(e) => handleFilterChange('amount', e.target.value)} />
                <Select value={filters.status || 'empty'} onValueChange={(v) => handleFilterChange('status', v === 'empty' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Статус" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="empty">Все статусы</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Success">Success</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.payedAt || 'empty'} onValueChange={(v) => handleFilterChange('payedAt', v === 'empty' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Статус оплаты" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="empty">Все (Оплата)</SelectItem>
                    <SelectItem value="paid">Оплачено</SelectItem>
                    <SelectItem value="not_paid">Не оплачено</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <CustomsDataTable 
                data={sortedData}
                loading={loading}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                selectedRows={selectedRows}
                onToggleSelect={toggleSelect}
                onToggleSelectAll={toggleSelectAll}
                payingIds={payingIds}
                onPaySingle={handlePaySingleClick}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statement">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg font-medium text-slate-800">Выписка из АБС</CardTitle>
              <div className="flex items-center space-x-2 mt-4 md:mt-0">
                <div className="flex items-center">
                  <span className="text-sm text-slate-500 mr-2">С</span>
                  <Input type="date" value={absStartDate} onChange={(e) => setAbsStartDate(e.target.value)} className="w-40 h-8" />
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-slate-500 mr-2">По</span>
                  <Input type="date" value={absEndDate} onChange={(e) => setAbsEndDate(e.target.value)} className="w-40 h-8" />
                </div>
                <Button onClick={fetchStatement} disabled={statementLoading} className="h-8 bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className={`mr-2 h-4 w-4 ${statementLoading ? 'animate-spin' : ''}`} /> Запросить
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <AbsStatementTable data={flatStatementData} loading={statementLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showSingleConfirm} onOpenChange={setShowSingleConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение оплаты</DialogTitle>
            <DialogDescription className="pt-4 text-base">
              Вы точно уверены, что хотите оплатить эту таможню?
              <br /><br />
              После подтверждения начнется процесс оплаты. Отменить операцию будет невозможно.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowSingleConfirm(false)}>Отмена</Button>
            <Button onClick={handlePaySingleConfirm} className="bg-emerald-600 hover:bg-emerald-700">Да, оплатить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMultiConfirm} onOpenChange={setShowMultiConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение массовой оплаты</DialogTitle>
            <DialogDescription className="pt-4 text-base">
              Вы уверены, что хотите оплатить все выбранные таможни?
              <br /><br />
              Количество: <strong>{multiTxToPay.length}</strong>
              <br /><br />
              После подтверждения начнется процесс оплаты. Отменить операцию будет невозможно.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowMultiConfirm(false)}>Отмена</Button>
            <Button onClick={handlePayMultiConfirm} className="bg-emerald-600 hover:bg-emerald-700">Да, оплатить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
