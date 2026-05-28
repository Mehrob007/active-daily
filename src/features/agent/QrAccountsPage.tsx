'use client';

import React, { useState, useMemo } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { DataTable, KPICard, StatusBadge } from '@/components/banking';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ColumnDef } from '@tanstack/react-table';
import {
  QrCode,
  ArrowDownToLine,
  Wallet,
  Receipt,
  Search,
  Filter,
} from 'lucide-react';

type QrStatus = 'completed' | 'pending' | 'failed' | 'reversed';
type WithdrawStatus = 'completed' | 'pending' | 'rejected';

interface QrTransaction {
  id: string;
  merchant: string;
  amount: number;
  commission: number;
  status: QrStatus;
  dateTime: string;
}

interface WithdrawRequest {
  id: string;
  clientName: string;
  account: string;
  amount: number;
  status: WithdrawStatus;
  requestedDate: string;
  processedDate: string | null;
}

const mockQrTransactions: QrTransaction[] = [
  { id: 'QR-001', merchant: 'КазМунайГаз АЗС', amount: 15000, commission: 75, status: 'completed', dateTime: '2025-05-15 14:32' },
  { id: 'QR-002', merchant: 'Роспродукт Алматы', amount: 8450, commission: 42, status: 'completed', dateTime: '2025-05-15 13:15' },
  { id: 'QR-003', merchant: 'Kaspi Магазин', amount: 125000, commission: 625, status: 'completed', dateTime: '2025-05-15 12:45' },
  { id: 'QR-004', merchant: 'Пекарня «Хруст»', amount: 3200, commission: 16, status: 'pending', dateTime: '2025-05-15 11:30' },
  { id: 'QR-005', merchant: 'Аптека «Здоровье»', amount: 18500, commission: 92, status: 'completed', dateTime: '2025-05-15 10:22' },
  { id: 'QR-006', merchant: 'Parfum Парфюм', amount: 45000, commission: 225, status: 'failed', dateTime: '2025-05-15 09:18' },
  { id: 'QR-007', merchant: 'Glovo Доставка', amount: 6780, commission: 34, status: 'completed', dateTime: '2025-05-14 19:45' },
  { id: 'QR-008', merchant: 'Mercato Супермаркет', amount: 23400, commission: 117, status: 'reversed', dateTime: '2025-05-14 18:30' },
  { id: 'QR-009', merchant: 'Спортмастер', amount: 89000, commission: 445, status: 'completed', dateTime: '2025-05-14 16:10' },
  { id: 'QR-010', merchant: 'KFC Казахстан', amount: 5600, commission: 28, status: 'completed', dateTime: '2025-05-14 14:55' },
  { id: 'QR-011', merchant: 'Магнит Косметик', amount: 12300, commission: 61, status: 'pending', dateTime: '2025-05-14 13:20' },
  { id: 'QR-012', merchant: 'Halyk Finance', amount: 500000, commission: 2500, status: 'completed', dateTime: '2025-05-14 11:00' },
];

const mockWithdrawals: WithdrawRequest[] = [
  { id: 'WD-001', clientName: 'Каримов Алишер Р.', account: 'KZ00****4521', amount: 200000, status: 'completed', requestedDate: '2025-05-15 09:00', processedDate: '2025-05-15 10:30' },
  { id: 'WD-002', clientName: 'Рахимова Дилноза У.', account: 'KZ00****7832', amount: 500000, status: 'completed', requestedDate: '2025-05-15 08:30', processedDate: '2025-05-15 09:45' },
  { id: 'WD-003', clientName: 'Мирзаев Бекзод Т.', account: 'KZ00****1093', amount: 150000, status: 'pending', requestedDate: '2025-05-15 11:15', processedDate: null },
  { id: 'WD-004', clientName: 'Турсунов Жасур К.', account: 'KZ00****3398', amount: 750000, status: 'completed', requestedDate: '2025-05-14 16:00', processedDate: '2025-05-14 17:20' },
  { id: 'WD-005', clientName: 'Ахметов Санжар Б.', account: 'KZ00****5547', amount: 300000, status: 'rejected', requestedDate: '2025-05-14 14:30', processedDate: '2025-05-14 15:00' },
  { id: 'WD-006', clientName: 'Исаева Гулнора Х.', account: 'KZ00****2276', amount: 100000, status: 'completed', requestedDate: '2025-05-14 10:00', processedDate: '2025-05-14 11:15' },
  { id: 'WD-007', clientName: 'Назаров Тимур С.', account: 'KZ00****4410', amount: 450000, status: 'pending', requestedDate: '2025-05-15 12:00', processedDate: null },
  { id: 'WD-008', clientName: 'Жумабаева Айдана К.', account: 'KZ00****9935', amount: 250000, status: 'completed', requestedDate: '2025-05-14 09:30', processedDate: '2025-05-14 10:45' },
];

const qrColumns: ColumnDef<QrTransaction>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">{row.getValue('id')}</span>
    ),
  },
  {
    accessorKey: 'merchant',
    header: 'Мерчант',
    cell: ({ row }) => <span className="font-medium">{row.getValue('merchant')}</span>,
  },
  {
    accessorKey: 'amount',
    header: 'Сумма',
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number;
      return <span className="font-medium">{amount.toLocaleString('ru-RU')} ₸</span>;
    },
  },
  {
    accessorKey: 'commission',
    header: 'Комиссия',
    cell: ({ row }) => {
      const commission = row.getValue('commission') as number;
      return <span className="text-muted-foreground">{commission.toLocaleString('ru-RU')} ₸</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
  },
  {
    accessorKey: 'dateTime',
    header: 'Дата / Время',
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">{row.getValue('dateTime')}</span>
    ),
  },
];

const withdrawColumns: ColumnDef<WithdrawRequest>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">{row.getValue('id')}</span>
    ),
  },
  {
    accessorKey: 'clientName',
    header: 'Клиент',
    cell: ({ row }) => <span className="font-medium">{row.getValue('clientName')}</span>,
  },
  {
    accessorKey: 'account',
    header: 'Счёт',
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">{row.getValue('account')}</span>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Сумма',
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number;
      return <span className="font-medium">{amount.toLocaleString('ru-RU')} ₸</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
  },
  {
    accessorKey: 'requestedDate',
    header: 'Дата заявки',
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">{row.getValue('requestedDate')}</span>
    ),
  },
  {
    accessorKey: 'processedDate',
    header: 'Обработано',
    cell: ({ row }) => {
      const date = row.getValue('processedDate') as string | null;
      return date ? (
        <span className="text-sm">{date}</span>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      );
    },
  },
];

export default function QrAccountsPage() {
  const [activeTab, setActiveTab] = useState<string>('qr');
  const [qrStatusFilter, setQrStatusFilter] = useState<string>('all');
  const [wdStatusFilter, setWdStatusFilter] = useState<string>('all');

  const filteredQr = useMemo(() => {
    if (qrStatusFilter === 'all') return mockQrTransactions;
    return mockQrTransactions.filter((t) => t.status === qrStatusFilter);
  }, [qrStatusFilter]);

  const filteredWd = useMemo(() => {
    if (wdStatusFilter === 'all') return mockWithdrawals;
    return mockWithdrawals.filter((w) => w.status === wdStatusFilter);
  }, [wdStatusFilter]);

  const totalQrVolume = mockQrTransactions.reduce((s, t) => s + t.amount, 0);
  const totalQrCommission = mockQrTransactions.reduce((s, t) => s + t.commission, 0);
  const todayWithdrawals = mockWithdrawals.filter(
    (w) => w.requestedDate.startsWith('2025-05-15')
  ).length;

  return (
    <PageContainer
      title="QR и счета"
      subtitle="QR-платежи и управление счетами"
    >
      {}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard
          title="Объём QR-транзакций"
          value={`${(totalQrVolume / 1000).toFixed(0)}K ₸`}
          change="+18,2%"
          changeType="positive"
          icon={QrCode}
        />
        <KPICard
          title="Комиссия QR"
          value={`${(totalQrCommission / 1000).toFixed(1)}K ₸`}
          change="+18,2%"
          changeType="positive"
          icon={Receipt}
        />
        <KPICard
          title="Снятия сегодня"
          value={todayWithdrawals}
          change="+1"
          changeType="neutral"
          icon={ArrowDownToLine}
        />
      </div>

      {}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="qr" className="gap-2">
            <QrCode className="h-4 w-4" />
            QR Транзакции
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="gap-2">
            <Wallet className="h-4 w-4" />
            Заявки на снятие
          </TabsTrigger>
        </TabsList>

        {}
        <TabsContent value="qr" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={qrStatusFilter} onValueChange={setQrStatusFilter}>
              <SelectTrigger className="h-9 w-full sm:w-[200px]">
                <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="completed">Выполненные</SelectItem>
                <SelectItem value="pending">В ожидании</SelectItem>
                <SelectItem value="failed">Ошибка</SelectItem>
                <SelectItem value="reversed">Возвращено</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1" />
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск по мерчанту..."
                className="h-9 w-full pl-8 sm:w-[220px]"
              />
            </div>
          </div>

          <DataTable
            columns={qrColumns}
            data={filteredQr}
            searchKey="merchant"
            searchPlaceholder="Поиск по мерчанту..."
            pageSize={10}
          />
        </TabsContent>

        {}
        <TabsContent value="withdraw" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={wdStatusFilter} onValueChange={setWdStatusFilter}>
              <SelectTrigger className="h-9 w-full sm:w-[200px]">
                <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="completed">Выполненные</SelectItem>
                <SelectItem value="pending">В ожидании</SelectItem>
                <SelectItem value="rejected">Отклонено</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1" />
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск по клиенту..."
                className="h-9 w-full pl-8 sm:w-[220px]"
              />
            </div>
          </div>

          <DataTable
            columns={withdrawColumns}
            data={filteredWd}
            searchKey="clientName"
            searchPlaceholder="Поиск по имени клиента..."
            pageSize={10}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
