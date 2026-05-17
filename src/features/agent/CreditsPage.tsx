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
import { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  Filter,
  Banknote,
  Wallet,
  Percent,
  Clock,
  Search,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────

type CreditStatus = 'active' | 'approved' | 'pending' | 'rejected' | 'closed';
type CreditType = 'consumer' | 'auto' | 'mortgage' | 'education' | 'express';

interface CreditItem {
  id: string;
  clientName: string;
  product: string;
  creditType: CreditType;
  amount: number;
  termMonths: number;
  rate: number;
  status: CreditStatus;
  date: string;
}

// ─── Helpers ──────────────────────────────────────────────────

function calcMonthlyPayment(amount: number, annualRate: number, termMonths: number): number {
  if (annualRate === 0) return amount / termMonths;
  const r = annualRate / 100 / 12;
  const pow = Math.pow(1 + r, termMonths);
  return (amount * r * pow) / (pow - 1);
}

// ─── Mock Data ────────────────────────────────────────────────

const mockCredits: CreditItem[] = [
  { id: 'CR-001', clientName: 'Каримов Алишер Р.', product: 'Потребительский кредит', creditType: 'consumer', amount: 3500000, termMonths: 36, rate: 18.5, status: 'active', date: '2025-03-15' },
  { id: 'CR-002', clientName: 'Рахимова Дилноза У.', product: 'Автокредит', creditType: 'auto', amount: 12000000, termMonths: 60, rate: 15.0, status: 'active', date: '2025-02-20' },
  { id: 'CR-003', clientName: 'Мирзаев Бекзод Т.', product: 'Ипотека', creditType: 'mortgage', amount: 35000000, termMonths: 240, rate: 12.5, status: 'active', date: '2025-01-10' },
  { id: 'CR-004', clientName: 'Сидорова Нодира А.', product: 'Образовательный кредит', creditType: 'education', amount: 2000000, termMonths: 48, rate: 14.0, status: 'pending', date: '2025-05-12' },
  { id: 'CR-005', clientName: 'Турсунов Жасур К.', product: 'Экспресс-кредит', creditType: 'express', amount: 500000, termMonths: 12, rate: 22.0, status: 'approved', date: '2025-05-14' },
  { id: 'CR-006', clientName: 'Умарова Зулфия М.', product: 'Потребительский кредит', creditType: 'consumer', amount: 5000000, termMonths: 24, rate: 17.0, status: 'pending', date: '2025-05-15' },
  { id: 'CR-007', clientName: 'Ахметов Санжар Б.', product: 'Автокредит', creditType: 'auto', amount: 8500000, termMonths: 48, rate: 14.5, status: 'active', date: '2025-04-01' },
  { id: 'CR-008', clientName: 'Исаева Гулнора Х.', product: 'Потребительский кредит', creditType: 'consumer', amount: 1500000, termMonths: 18, rate: 19.0, status: 'rejected', date: '2025-05-10' },
  { id: 'CR-009', clientName: 'Назаров Тимур С.', product: 'Ипотека', creditType: 'mortgage', amount: 28000000, termMonths: 180, rate: 13.0, status: 'pending', date: '2025-05-13' },
  { id: 'CR-010', clientName: 'Касымова Мухаббат Ж.', product: 'Экспресс-кредит', creditType: 'express', amount: 300000, termMonths: 6, rate: 24.0, status: 'active', date: '2025-04-20' },
  { id: 'CR-011', clientName: 'Бекетов Руслан Д.', product: 'Потребительский кредит', creditType: 'consumer', amount: 7000000, termMonths: 36, rate: 16.5, status: 'approved', date: '2025-05-11' },
  { id: 'CR-012', clientName: 'Жумабаева Айдана К.', product: 'Образовательный кредит', creditType: 'education', amount: 1500000, termMonths: 36, rate: 13.5, status: 'active', date: '2025-03-25' },
  { id: 'CR-013', clientName: 'Поляков Андрей В.', product: 'Автокредит', creditType: 'auto', amount: 15000000, termMonths: 60, rate: 14.0, status: 'pending', date: '2025-05-14' },
  { id: 'CR-014', clientName: 'Сериков Данияр А.', product: 'Потребительский кредит', creditType: 'consumer', amount: 2500000, termMonths: 24, rate: 18.0, status: 'closed', date: '2024-11-01' },
  { id: 'CR-015', clientName: 'Нурланова Мадина Е.', product: 'Экспресс-кредит', creditType: 'express', amount: 750000, termMonths: 12, rate: 21.0, status: 'rejected', date: '2025-05-09' },
];

// ─── Type Badge ───────────────────────────────────────────────

function CreditTypeBadge({ type }: { type: CreditType }) {
  const config: Record<CreditType, { label: string; className: string }> = {
    consumer:  { label: 'Потребительский', className: 'bg-bank-coal/10 text-bank-coal border-bank-coal/20' },
    auto:      { label: 'Автокредит',      className: 'bg-bank-info/15 text-bank-info border-bank-info/20' },
    mortgage:  { label: 'Ипотека',         className: 'bg-bank-success/15 text-bank-success border-bank-success/20' },
    education: { label: 'Образование',     className: 'bg-bank-warning/15 text-bank-warning border-bank-warning/20' },
    express:   { label: 'Экспресс',        className: 'bg-bank-red/15 text-bank-red border-bank-red/20' },
  };
  const c = config[type];
  return (
    <Badge variant="outline" className={`text-xs font-medium border ${c.className}`}>
      {c.label}
    </Badge>
  );
}

// ─── Column Definitions ───────────────────────────────────────

const columns: ColumnDef<CreditItem>[] = [
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
    accessorKey: 'product',
    header: 'Продукт',
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue('product')}</span>
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
    accessorKey: 'termMonths',
    header: 'Срок (мес.)',
    cell: ({ row }) => (
      <span className="tabular-nums text-center">{row.getValue('termMonths')}</span>
    ),
  },
  {
    accessorKey: 'rate',
    header: 'Ставка %',
    cell: ({ row }) => (
      <span className="font-medium text-bank-red">{row.getValue('rate')}%</span>
    ),
  },
  {
    accessorKey: 'monthlyPayment',
    header: 'Ежемес. платёж',
    cell: ({ row }) => {
      const original = row.original;
      const mp = Math.round(calcMonthlyPayment(original.amount, original.rate, original.termMonths));
      return <span className="font-semibold">{mp.toLocaleString('ru-RU')} ₸</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
  },
  {
    accessorKey: 'date',
    header: 'Дата',
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue('date')}</span>
    ),
  },
];

// ─── Page Component ───────────────────────────────────────────

export default function CreditsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredData = useMemo(() => {
    return mockCredits.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (typeFilter !== 'all' && c.creditType !== typeFilter) return false;
      return true;
    });
  }, [statusFilter, typeFilter]);

  // KPI calculations
  const activeCredits = mockCredits.filter((c) => c.status === 'active').length;
  const totalPortfolio = mockCredits
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + c.amount, 0);
  const avgRate =
    mockCredits.filter((c) => c.status === 'active').reduce((sum, c) => sum + c.rate, 0) /
    (activeCredits || 1);
  const pendingCount = mockCredits.filter((c) => c.status === 'pending').length;

  return (
    <PageContainer
      title="Кредиты"
      subtitle="Кредитные заявки и управление портфелем"
      actions={
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-bank-red px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-bank-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bank-red/40"
          onClick={() => alert('Новая кредитная заявка — в разработке')}
        >
          <Plus className="h-4 w-4" />
          Новая кредитная заявка
        </button>
      }
    >
      {/* ── KPI Cards ─────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Активные кредиты"
          value={activeCredits}
          change="+3"
          changeType="positive"
          icon={Banknote}
        />
        <KPICard
          title="Портфель"
          value={`${(totalPortfolio / 1000000).toFixed(1)}M ₸`}
          change="+12,5%"
          changeType="positive"
          icon={Wallet}
        />
        <KPICard
          title="Средняя ставка"
          value={`${avgRate.toFixed(1)}%`}
          change="−0,3%"
          changeType="negative"
          icon={Percent}
        />
        <KPICard
          title="На рассмотрении"
          value={pendingCount}
          change="+2"
          changeType="neutral"
          icon={Clock}
        />
      </div>

      {/* ── Filter Bar ────────────────────────────────────── */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-full sm:w-[200px]">
            <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="active">Активные</SelectItem>
            <SelectItem value="approved">Одобрено</SelectItem>
            <SelectItem value="pending">На рассмотрении</SelectItem>
            <SelectItem value="rejected">Отклонено</SelectItem>
            <SelectItem value="closed">Закрытые</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-9 w-full sm:w-[200px]">
            <SelectValue placeholder="Тип кредита" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            <SelectItem value="consumer">Потребительский</SelectItem>
            <SelectItem value="auto">Автокредит</SelectItem>
            <SelectItem value="mortgage">Ипотека</SelectItem>
            <SelectItem value="education">Образование</SelectItem>
            <SelectItem value="express">Экспресс</SelectItem>
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

      {/* ── Data Table ────────────────────────────────────── */}
      <DataTable
        columns={columns}
        data={filteredData}
        searchKey="clientName"
        searchPlaceholder="Поиск по имени клиента..."
        pageSize={10}
      />
    </PageContainer>
  );
}
