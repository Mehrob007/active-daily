'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { DataTable } from '@/components/banking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Filter,
  RefreshCw,
  Wallet,
  Play,
  RotateCcw,
} from 'lucide-react';
import { qrAgentService } from '../services/qr-agent-service';
import { QRWithdrawOperation } from '../types';
import { toast } from '@/hooks/use-toast';
import { ColumnDef } from '@tanstack/react-table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';

const STATEMENT_ACCOUNT_NUMBER = "26202972381810638175";

export default function QRWithdrawOperationsPage() {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  
  const [operations, setOperations] = useState<QRWithdrawOperation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [payingKeys, setPayingKeys] = useState<Set<string>>(new Set());
  
  const [filterText, setFilterText] = useState('');
  const [filterPaid, setFilterPaid] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const [confirmTarget, setConfirmTarget] = useState<QRWithdrawOperation | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async (showSuccess = false) => {
    setIsLoading(true);
    try {
      const format = (d: string) => d.split('-').reverse().join('.');
      const data = await qrAgentService.getWithdrawOperations(format(startDate), format(endDate), STATEMENT_ACCOUNT_NUMBER);
      
      const flat = (data || []).flatMap((day: any) =>
        (day.Transactions || []).map((tx: any) => ({
          ...tx,
          doper: day.DOPER,
          kurs: day.Kurs,
          sumBalOut: day.SumBalOut,
          sumMovD: day.SumMovD,
          sumMovC: day.SumMovC,
          account: day.Account,
          _key: `${day.DOPER}__${tx.NUMDOC}__${tx.REFER}`,
        }))
      );
      
      setOperations(flat);
      if (showSuccess) {
        toast({ title: 'Успешно', description: `Загружено ${flat.length} транзакций` });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить выписку', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  const silentRefresh = useCallback(async () => {
    try {
      const format = (d: string) => d.split('-').reverse().join('.');
      const data = await qrAgentService.getWithdrawOperations(format(startDate), format(endDate), STATEMENT_ACCOUNT_NUMBER);
      const flat = (data || []).flatMap((day: any) =>
        (day.Transactions || []).map((tx: any) => ({
          ...tx,
          doper: day.DOPER,
          kurs: day.Kurs,
          sumBalOut: day.SumBalOut,
          sumMovD: day.SumMovD,
          sumMovC: day.SumMovC,
          account: day.Account,
          _key: `${day.DOPER}__${tx.NUMDOC}__${tx.REFER}`,
        }))
      );
      setOperations(flat);
    } catch (err) {
      console.error('Silent refresh failed:', err);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    return operations.filter((row) => {
      if (filterPaid === 'paid' && !row.IsPayed) return false;
      if (filterPaid === 'unpaid' && row.IsPayed) return false;
      
      if (filterText) {
        const q = filterText.toLowerCase();
        return [row.NUMDOC, row.CLIENTCOR, row.TXTDSCR, row.REFER, row.ACCCOR, row.NAMEBCR].some(
          v => v && String(v).toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [operations, filterPaid, filterText]);

  const handlePay = async (row: QRWithdrawOperation) => {
    setPayingKeys(prev => new Set([...prev, row._key]));
    try {
      await qrAgentService.payOperation(row);
      toast({ title: 'Успешно', description: `Транзакция №${row.NUMDOC} оплачена` });
      setTimeout(silentRefresh, 800);
    } catch (err: any) {
      toast({ title: 'Ошибка оплаты', description: err.message, variant: 'destructive' });
    } finally {
      setPayingKeys(prev => {
        const next = new Set(prev);
        next.delete(row._key);
        return next;
      });
    }
  };

  const handleBulkPay = async () => {
    const toPay = filteredData.filter(row => selectedKeys.has(row._key) && !row.IsPayed);
    if (toPay.length === 0) return;
    
    setShowBulkConfirm(false);
    setPayingKeys(prev => {
      const next = new Set(prev);
      toPay.forEach(r => next.add(r._key));
      return next;
    });

    let ok = 0;
    let fail = 0;
    const batchSize = 10;

    for (let i = 0; i < toPay.length; i += batchSize) {
      const batch = toPay.slice(i, i + batchSize);
      await Promise.all(batch.map(async (row) => {
        try {
          await qrAgentService.payOperation(row);
          ok++;
        } catch (err) {
          fail++;
        }
      }));
      if (i + batchSize < toPay.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    toast({ 
      title: 'Массовая оплата завершена', 
      description: `Успешно: ${ok}, Ошибок: ${fail}`,
      variant: fail > 0 ? 'warning' : 'default' as any
    });
    
    setPayingKeys(prev => {
      const next = new Set(prev);
      toPay.forEach(r => next.delete(r._key));
      return next;
    });
    setTimeout(silentRefresh, 800);
    setSelectedKeys(new Set());
  };

  const toggleSelectAll = () => {
    if (selectedKeys.size === filteredData.length && filteredData.length > 0) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(filteredData.map(r => r._key)));
    }
  };

  const selectUnpaid = () => {
    const unpaid = filteredData.filter(r => !r.IsPayed).map(r => r._key);
    setSelectedKeys(new Set(unpaid));
  };

  const columns: ColumnDef<QRWithdrawOperation>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={selectedKeys.size === filteredData.length && filteredData.length > 0}
          onCheckedChange={toggleSelectAll}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedKeys.has(row.original._key)}
          onCheckedChange={(checked) => {
            setSelectedKeys(prev => {
              const next = new Set(prev);
              if (checked) next.add(row.original._key);
              else next.delete(row.original._key);
              return next;
            });
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    { 
      accessorKey: 'doper', 
      header: 'Дата оп.',
      cell: ({ row }) => <span className="text-xs">{row.original.doper}</span>
    },
    { 
      accessorKey: 'NUMDOC', 
      header: '№ Док.',
      cell: ({ row }) => <span className="font-mono text-xs font-semibold">{row.original.NUMDOC}</span>
    },
    { 
      accessorKey: 'TXTDSCR', 
      header: 'Описание',
      cell: ({ row }) => <span className="text-xs max-w-[200px] truncate block" title={row.original.TXTDSCR}>{row.original.TXTDSCR}</span>
    },
    { 
      accessorKey: 'CLIENTCOR', 
      header: 'Клиент-корр.',
      cell: ({ row }) => <span className="text-xs">{row.original.CLIENTCOR}</span>
    },
    { 
      accessorKey: 'MOVD', 
      header: 'Дебет',
      cell: ({ row }) => <span className="tabular-nums">{row.original.MOVD}</span>
    },
    { 
      accessorKey: 'MOVC', 
      header: 'Кредит',
      cell: ({ row }) => <span className="tabular-nums font-bold text-emerald-600">{row.original.MOVC}</span>
    },
    { 
      accessorKey: 'IsPayed', 
      header: 'Статус',
      cell: ({ row }) => row.original.IsPayed ? 
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1"><CheckCircle2 className="size-3" /> Оплачено</Badge> :
        <Badge className="bg-slate-50 text-slate-500 border-slate-200 gap-1"><Clock className="size-3" /> Ожидает</Badge>
    },
    { 
      id: 'actions', 
      header: 'Действия',
      cell: ({ row }) => {
        const isPaying = payingKeys.has(row.original._key);
        const isPaid = row.original.IsPayed;
        return (
          <Button 
            size="sm" 
            variant={isPaid ? "ghost" : "default"}
            disabled={isPaid || isPaying}
            className={isPaid ? "text-emerald-600 h-7 text-[11px]" : "bg-bank-red hover:bg-bank-red/90 h-7 text-[11px]"}
            onClick={() => setConfirmTarget(row.original)}
          >
            {isPaying ? '...' : isPaid ? 'Оплачено' : 'Оплатить'}
          </Button>
        );
      }
    },
  ];

  const stats = {
    total: operations.length,
    paid: operations.filter(o => o.IsPayed).length,
    unpaid: operations.filter(o => !o.IsPayed).length,
    selected: selectedKeys.size,
  };

  return (
    <PageContainer title="Операции QR АБС" subtitle="Список межбанковских QR операций в АБС">
      
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">От</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 w-40" />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">До</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 w-40" />
          </div>
          <Button variant="outline" size="icon" onClick={() => fetchData(true)} disabled={isLoading}>
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className={showFilters ? 'bg-bank-active text-bank-red border-bank-red' : 'gap-2'}>
            <Filter className="size-4" /> Фильтры
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={selectUnpaid}
            className="gap-2 border-amber-200 text-amber-700 hover:bg-amber-50"
          >
            <RotateCcw className="size-4" /> Выбрать неоплаченные
          </Button>
          <Button 
            size="sm" 
            className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={selectedKeys.size === 0 || payingKeys.size > 0}
            onClick={() => setShowBulkConfirm(true)}
          >
            <Play className="size-4" /> Оплатить выбранные ({selectedKeys.size})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center">
            <Wallet className="size-5 text-slate-600" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Всего</p>
            <p className="text-xl font-bold">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="size-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="size-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Оплачено</p>
            <p className="text-xl font-bold text-emerald-600">{stats.paid}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="size-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="size-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Ожидает</p>
            <p className="text-xl font-bold text-amber-600">{stats.unpaid}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 border-l-4 border-l-bank-red">
          <div className="size-10 rounded-full bg-rose-50 flex items-center justify-center">
            <Play className="size-5 text-bank-red" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Выбрано</p>
            <p className="text-xl font-bold text-bank-red">{stats.selected}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="size-10 rounded-full bg-bank-active flex items-center justify-center">
            <CreditCard className="size-5 text-bank-red" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Счет АБС</p>
            <p className="text-xs font-mono font-medium truncate w-24">{STATEMENT_ACCOUNT_NUMBER}</p>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex flex-wrap gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex-1 min-w-[200px] space-y-1.5">
            <Label className="text-xs">Поиск</Label>
            <Input size="sm" placeholder="Документ, клиент, описание..." value={filterText} onChange={(e) => setFilterText(e.target.value)} />
          </div>
          <div className="w-48 space-y-1.5">
            <Label className="text-xs">Статус</Label>
            <select 
              value={filterPaid} 
              onChange={(e: any) => setFilterPaid(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">Все статусы</option>
              <option value="paid">Оплачено</option>
              <option value="unpaid">Не оплачено</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="ghost" size="sm" onClick={() => {setFilterText(''); setFilterPaid('all');}} className="text-bank-red">
              Сбросить
            </Button>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        pageSize={15}
        emptyMessage="Нет транзакций за выбранный период"
      />

      <AlertDialog open={!!confirmTarget} onOpenChange={() => setConfirmTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение оплаты</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите оплатить транзакцию №{confirmTarget?.NUMDOC}?
              <br />
              <strong>Описание:</strong> {confirmTarget?.TXTDSCR}
              <br />
              <strong>Сумма:</strong> {confirmTarget?.MOVC} с.
              <br /><br />
              Это действие необратимо.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmTarget && handlePay(confirmTarget)} className="bg-bank-red hover:bg-bank-red/90 text-white">
              Да, оплатить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBulkConfirm} onOpenChange={setShowBulkConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Массовая оплата</AlertDialogTitle>
            <AlertDialogDescription>
              Вы собираетесь оплатить <strong>{selectedKeys.size}</strong> транзакций. 
              Процесс может занять некоторое время.
              <br /><br />
              Продолжить?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkPay} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Да, оплатить все
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </PageContainer>
  );
}
