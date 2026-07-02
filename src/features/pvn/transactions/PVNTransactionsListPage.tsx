'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Download, CheckCircle2, Clock, PlayCircle, Loader2, Filter } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { getPVNTransactions, paySinglePVNTransaction, PVNTransaction } from '../services/pvn-service';

function isPaidTransaction(row: PVNTransaction) {
  const payedObj = row.transaction_card_payed;
  if (!payedObj) return false;
  return payedObj.is_payed === true || payedObj.isPayed === true;
}

function formatAmount(value: any) {
  if (typeof value !== 'number') return value;
  return (value / 100).toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDateForDisplay(dateString: string | undefined) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    if (dateString.includes('0001-01-01')) return 'Не оплачено';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  } catch {
    return dateString;
  }
}

function getCurrencySymbol(code: number | undefined) {
  if (code === 972) return 'TJS';
  if (code === 810) return 'RUB';
  if (code === 840) return 'USD';
  if (code === 978) return 'EUR';
  return code || '';
}

export function PVNTransactionsListPage() {
  const [data, setData] = useState<PVNTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [payingIds, setPayingIds] = useState<Set<string>>(new Set());

  const [fromDateTime, setFromDateTime] = useState('');
  const [toDateTime, setToDateTime] = useState('');

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [showPayConfirmation, setShowPayConfirmation] = useState(false);
  const [paymentsToProcess, setPaymentsToProcess] = useState<PVNTransaction[]>([]);
  const [showSinglePayConfirmation, setShowSinglePayConfirmation] = useState(false);
  const [singlePaymentData, setSinglePaymentData] = useState<PVNTransaction | null>(null);

  const fetchTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
    setFromDateTime(fiveMinutesAgo.toISOString().slice(0, 16));
    setToDateTime(now.toISOString().slice(0, 16));
  }, []);

  const fetchData = useCallback(async () => {
    if (!fromDateTime || !toDateTime) return;
    
    if (new Date(fromDateTime) > new Date(toDateTime)) {
      toast.error('Дата начала не может быть позже даты окончания');
      return;
    }

    try {
      setLoading(true);
      const json = await getPVNTransactions(fromDateTime, toDateTime);
      setData(json || []);
      toast.success(`Загружено ${json.length} транзакций`);
      setSelectedRows([]);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Ошибка загрузки данных');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fromDateTime, toDateTime]);

  useEffect(() => {
    if (fromDateTime && toDateTime) {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = setTimeout(() => {
        fetchData();
      }, 500);
    }
    return () => {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, [fromDateTime, toDateTime, fetchData]);

  const filteredData = useMemo(() => {
    return data.filter((row) =>
      Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const rowValue = row[key];
        if (rowValue == null) return false;
        if (typeof rowValue === 'number') return String(rowValue).includes(value);
        if (typeof rowValue === 'boolean') return String(rowValue).toLowerCase() === value.toLowerCase();
        if (typeof rowValue === 'string') return rowValue.toLowerCase().includes(String(value).toLowerCase());
        return false;
      })
    );
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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCheckboxToggle = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((p) => p !== id));
    }
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === sortedData.length && sortedData.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(sortedData.map((r) => r.id));
    }
  };

  const selectAllUnpaid = () => {
    setSelectedRows(sortedData.filter((row) => !isPaidTransaction(row)).map((r) => r.id));
  };

  const selectAllPaid = () => {
    setSelectedRows(sortedData.filter((row) => isPaidTransaction(row)).map((r) => r.id));
  };

  const handleExport = () => {
    if (selectedRows.length === 0) {
      toast.warning('Нет выбранных записей для экспорта');
      return;
    }

    const selectedData = sortedData.filter((row) => selectedRows.includes(row.id));
    if (selectedData.length === 0) return;

    const rows = selectedData.map((row) => ({
      'ID': row.id,
      'Номер карты': row.cardNumber,
      'Сумма': typeof row.amount === 'number' ? row.amount / 100 : row.amount,
      'Валюта': getCurrencySymbol(row.currency),
      'Дата транзакции': formatDateForDisplay(row.localTransactionDate),
      'Время': row.localTransactionTime,
      'Терминал': row.terminalId,
      'ATM ID': row.atmId,
      'Utrnno': row.utrnno,
      'Оплата - Utrnno': row.transaction_card_payed?.utrnno || '',
      'Оплата - Статус': isPaidTransaction(row) ? 'Оплачено' : 'Не оплачено',
      'Оплата - Дата создания': formatDateForDisplay(row.transaction_card_payed?.createdAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Транзакции');
    XLSX.writeFile(workbook, `pvn_transactions_${new Date().toISOString().slice(0, 10)}.xlsx`);

    toast.success(`Экспортировано ${selectedData.length} записей`);
    setSelectedRows([]);
  };

  const handlePay = (transaction: PVNTransaction) => {
    if (isPaidTransaction(transaction)) {
      toast.warning('Транзакция уже оплачена');
      return;
    }
    setSinglePaymentData(transaction);
    setShowSinglePayConfirmation(true);
  };

  const performSinglePayment = async () => {
    if (!singlePaymentData) return;
    setShowSinglePayConfirmation(false);
    const transaction = singlePaymentData;
    setSinglePaymentData(null);
    setPayingIds((prev) => new Set([...prev, transaction.utrnno!]));

    try {
      await paySinglePVNTransaction(transaction);
      toast.success('Оплата успешно отправлена!');
      setTimeout(() => fetchData(), 1000);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Не удалось отправить оплату');
    } finally {
      setPayingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(transaction.utrnno!);
        return newSet;
      });
    }
  };

  const handlePayAll = () => {
    const toPay = sortedData.filter((row) => selectedRows.includes(row.id) && !isPaidTransaction(row));
    if (toPay.length === 0) {
      toast.warning('Нет выбранных неоплаченных записей для оплаты');
      return;
    }
    setPaymentsToProcess(toPay);
    setShowPayConfirmation(true);
  };

  const performPayment = async (toPay: PVNTransaction[]) => {
    setShowPayConfirmation(false);
    setPayingIds((prev) => new Set([...prev, ...toPay.map((r) => r.utrnno!)]));
    
    let successes = 0;
    let fails = [];
    const batchSize = 50;
    const delayMs = 2000;

    try {
      for (let i = 0; i < toPay.length; i += batchSize) {
        const batch = toPay.slice(i, i + batchSize);
        const promises = batch.map(async (transaction) => {
          try {
            await paySinglePVNTransaction(transaction);
            successes++;
          } catch (err: any) {
            fails.push({ utrnno: transaction.utrnno, error: err.message });
          }
        });
        await Promise.all(promises);
        if (i + batchSize < toPay.length) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
      if (fails.length === 0) {
        toast.success(`Успешно оплачено: ${successes}`);
      } else {
        toast.warning(`Оплачено: ${successes}. Ошибок: ${fails.length}`);
      }
      setTimeout(() => fetchData(), 1000);
    } catch (err: any) {
      toast.error('Критическая ошибка во время массовой оплаты');
    } finally {
      setPayingIds((prev) => {
        const newSet = new Set(prev);
        toPay.forEach((r) => newSet.delete(r.utrnno!));
        return newSet;
      });
    }
  };

  const totalSelected = selectedRows.length;
  const totalPaid = useMemo(() => sortedData.filter(isPaidTransaction).length, [sortedData]);
  const totalAmountSelected = useMemo(() => {
    return sortedData
      .filter((row) => selectedRows.includes(row.id))
      .reduce((sum, row) => sum + (row.amount || 0), 0) / 100;
  }, [sortedData, selectedRows]);

  const selectedCurrencySymbol = sortedData.length > 0 ? getCurrencySymbol(sortedData[0]?.currency) : '';

  return (
    <PageContainer title="ПВН транзакции" description="Управление транзакциями ПВН">
      <Card className="p-4 mb-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-50 border-slate-200">
        <div className="flex flex-wrap gap-2 items-center">
          <Button variant={showFilters ? "secondary" : "outline"} onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Фильтры
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={selectedRows.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button onClick={handlePayAll} disabled={selectedRows.length === 0 || payingIds.size > 0}>
            Оплатить выбранные
          </Button>
          <Button variant="outline" onClick={toggleSelectAll}>
            {selectedRows.length === sortedData.length && sortedData.length > 0 ? "Снять выделение" : "Выбрать все"}
          </Button>
          <Button variant="outline" onClick={selectAllUnpaid}>Неоплаченные</Button>
          <Button variant="outline" onClick={selectAllPaid}>Оплаченные</Button>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex flex-col">
            <span className="text-slate-500">Выбрано</span>
            <span className="font-semibold text-lg">{totalSelected}</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex flex-col">
            <span className="text-slate-500">Оплачено всего</span>
            <span className="font-semibold text-lg text-green-600">{totalPaid}</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex flex-col">
            <span className="text-slate-500">Сумма выбранных</span>
            <span className="font-semibold text-lg text-primary">
              {totalAmountSelected.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} {selectedCurrencySymbol}
            </span>
          </div>
        </div>
      </Card>

      {showFilters && (
        <Card className="p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4">
          <Input 
            placeholder="Номер карты" 
            onChange={(e) => setFilters((p) => ({ ...p, cardNumber: e.target.value }))}
          />
          <Input 
            placeholder="ATM ID" 
            onChange={(e) => setFilters((p) => ({ ...p, atmId: e.target.value }))}
          />
          <Input 
            placeholder="Utrnno" 
            onChange={(e) => setFilters((p) => ({ ...p, utrnno: e.target.value }))}
          />
          <Input 
            placeholder="Сумма" 
            type="number"
            onChange={(e) => setFilters((p) => ({ ...p, amount: e.target.value }))}
          />
        </Card>
      )}

      <Card className="p-4 mb-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">С</span>
          <Input
            type="datetime-local"
            value={fromDateTime}
            onChange={(e) => setFromDateTime(e.target.value)}
            className="w-[200px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">По</span>
          <Input
            type="datetime-local"
            value={toDateTime}
            onChange={(e) => setToDateTime(e.target.value)}
            className="w-[200px]"
          />
        </div>
      </Card>

      <Card className="overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[50px] text-center">
                  <Checkbox 
                    checked={selectedRows.length === sortedData.length && sortedData.length > 0} 
                    onCheckedChange={toggleSelectAll} 
                  />
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort('id')}>
                  ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort('cardNumber')}>
                  Номер карты {sortField === 'cardNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort('amount')}>
                  Сумма {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort('localTransactionDate')}>
                  Дата транзакции {sortField === 'localTransactionDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort('atmId')}>
                  ATM ID {sortField === 'atmId' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort('utrnno')}>
                  Utrnno {sortField === 'utrnno' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Статус оплаты</TableHead>
                <TableHead>Дата оплаты</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Загружаем транзакции...
                    </div>
                  </TableCell>
                </TableRow>
              ) : sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                    Нет данных для отображения
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((row) => {
                  const paid = isPaidTransaction(row);
                  const isPaying = payingIds.has(row.utrnno!);

                  return (
                    <TableRow key={row.id} className={paid ? "bg-green-50/50 hover:bg-green-50" : ""}>
                      <TableCell className="text-center">
                        <Checkbox 
                          checked={selectedRows.includes(row.id)}
                          onCheckedChange={(checked) => handleCheckboxToggle(row.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{row.id}</TableCell>
                      <TableCell>{row.cardNumber}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatAmount(row.amount)} {getCurrencySymbol(row.currency)}
                      </TableCell>
                      <TableCell>{formatDateForDisplay(row.localTransactionDate)} {row.localTransactionTime}</TableCell>
                      <TableCell>{row.atmId}</TableCell>
                      <TableCell>{row.utrnno}</TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-2 ${paid ? 'text-green-600 font-medium' : 'text-slate-500'}`}>
                          {paid ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                          {paid ? 'Оплачено' : 'Не оплачено'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDateForDisplay(row.transaction_card_payed?.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant={paid ? "ghost" : "default"}
                          disabled={paid || isPaying}
                          onClick={() => handlePay(row)}
                          className="min-w-[110px]"
                        >
                          {isPaying ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> В процессе</>
                          ) : paid ? (
                            <><CheckCircle2 className="w-4 h-4 mr-2 text-green-600" /> Оплачено</>
                          ) : (
                            <><PlayCircle className="w-4 h-4 mr-2" /> Оплатить</>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Single Payment Confirmation Dialog */}
      <Dialog open={showSinglePayConfirmation} onOpenChange={setShowSinglePayConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение оплаты</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите оплатить транзакцию с Utrnno: <strong>{singlePaymentData?.utrnno}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSinglePayConfirmation(false)}>Отмена</Button>
            <Button onClick={performSinglePayment}>Подтвердить оплату</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mass Payment Confirmation Dialog */}
      <Dialog open={showPayConfirmation} onOpenChange={setShowPayConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Массовая оплата</DialogTitle>
            <DialogDescription>
              Вы собираетесь оплатить <strong>{paymentsToProcess.length}</strong> транзакций. Процесс займет некоторое время.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayConfirmation(false)}>Отмена</Button>
            <Button onClick={() => performPayment(paymentsToProcess)}>Запустить оплату</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
