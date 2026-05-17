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

  const fetchData = useCallback(async () => {
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
    } catch (err) {
      console.error(err);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить выписку', variant: 'destructive' });
    } finally {
      setIsLoading(false);
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
      toast({ title: 'Успешно', description: 'Оплата успешно отправлена' });
      // Silent refresh
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

  const columns: ColumnDef<QRWithdrawOperation>[] = [
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
            className={isPaid ? "text-emerald-600" : "bg-bank-red hover:bg-bank-red/90 h-7 text-[11px]"}
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
          <Button variant="outline" size="icon" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className={showFilters ? 'bg-bank-active text-bank-red border-bank-red' : 'gap-2'}>
            <Filter className="size-4" /> Фильтры
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="size-10 rounded-full bg-bank-active flex items-center justify-center">
            <CreditCard className="size-5 text-bank-red" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Счет АБС</p>
            <p className="text-xs font-mono font-medium truncate w-32">{STATEMENT_ACCOUNT_NUMBER}</p>
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
              <strong>Сумма:</strong> {confirmTarget?.MOVC} {confirmTarget?.TXTDSCR}
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

    </PageContainer>
  );
}
