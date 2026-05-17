'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { DataTable, StatusBadge } from '@/components/banking';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColumnDef } from '@tanstack/react-table';
import type { Application, ApplicationStatus } from '@/types';
import {
  Plus,
  Search,
  Filter,
  CreditCard,
  Banknote,
  Landmark,
} from 'lucide-react';

// ─── Mock Data ──────────────────────────────────────────────────

const mockApplications: Application[] = [
  { id: 'APP-001', type: 'card', status: 'approved', clientId: 'CL-1042', clientName: 'Каримов Алишер Р.', productName: 'Visa Platinum', amount: 0, currency: 'KZT', createdAt: '2025-05-14', updatedAt: '2025-05-15', createdBy: 'agent01', notes: 'Премиальная карта' },
  { id: 'APP-002', type: 'credit', status: 'pending', clientId: 'CL-1098', clientName: 'Рахимова Дилноза У.', productName: 'Потребительский кредит', amount: 3500000, currency: 'KZT', createdAt: '2025-05-15', updatedAt: '2025-05-15', createdBy: 'agent02' },
  { id: 'APP-003', type: 'deposit', status: 'active', clientId: 'CL-1056', clientName: 'Мирзаев Бекзод Т.', productName: 'Вклад «Надёжный» 12 мес.', amount: 5000000, currency: 'KZT', createdAt: '2025-05-12', updatedAt: '2025-05-12', createdBy: 'agent01' },
  { id: 'APP-004', type: 'card', status: 'pending', clientId: 'CL-1102', clientName: 'Сидорова Нодира А.', productName: 'Visa Gold', amount: 0, currency: 'KZT', createdAt: '2025-05-15', updatedAt: '2025-05-15', createdBy: 'agent03' },
  { id: 'APP-005', type: 'credit', status: 'approved', clientId: 'CL-1078', clientName: 'Турсунов Жасур К.', productName: 'Автокредит', amount: 8000000, currency: 'KZT', createdAt: '2025-05-13', updatedAt: '2025-05-14', createdBy: 'agent02' },
  { id: 'APP-006', type: 'card', status: 'rejected', clientId: 'CL-1115', clientName: 'Умарова Зулфия М.', productName: 'Mastercard Standard', amount: 0, currency: 'KZT', createdAt: '2025-05-14', updatedAt: '2025-05-14', createdBy: 'agent01' },
  { id: 'APP-007', type: 'deposit', status: 'pending', clientId: 'CL-1123', clientName: 'Ахметов Санжар Б.', productName: 'Вклад «Рост» 6 мес.', amount: 2000000, currency: 'KZT', createdAt: '2025-05-15', updatedAt: '2025-05-15', createdBy: 'agent03' },
  { id: 'APP-008', type: 'credit', status: 'active', clientId: 'CL-1089', clientName: 'Исаева Гулнора Х.', productName: 'Ипотека', amount: 25000000, currency: 'KZT', createdAt: '2025-05-10', updatedAt: '2025-05-11', createdBy: 'agent02' },
  { id: 'APP-009', type: 'card', status: 'approved', clientId: 'CL-1134', clientName: 'Назаров Тимур С.', productName: 'Humo Classic', amount: 0, currency: 'KZT', createdAt: '2025-05-13', updatedAt: '2025-05-14', createdBy: 'agent01' },
  { id: 'APP-010', type: 'credit', status: 'rejected', clientId: 'CL-1067', clientName: 'Касымова Мухаббат Ж.', productName: 'Экспресс-кредит', amount: 500000, currency: 'KZT', createdAt: '2025-05-12', updatedAt: '2025-05-13', createdBy: 'agent03' },
  { id: 'APP-011', type: 'deposit', status: 'active', clientId: 'CL-1145', clientName: 'Поляков Андрей В.', productName: 'Вклад «Надёжный» 24 мес.', amount: 10000000, currency: 'KZT', createdAt: '2025-05-11', updatedAt: '2025-05-11', createdBy: 'agent02' },
  { id: 'APP-012', type: 'card', status: 'pending', clientId: 'CL-1156', clientName: 'Бекетов Руслан Д.', productName: 'UzCard Premium', amount: 0, currency: 'KZT', createdAt: '2025-05-15', updatedAt: '2025-05-15', createdBy: 'agent01' },
  { id: 'APP-013', type: 'credit', status: 'approved', clientId: 'CL-1034', clientName: 'Жумабаева Айдана К.', productName: 'Образовательный кредит', amount: 1500000, currency: 'KZT', createdAt: '2025-05-09', updatedAt: '2025-05-10', createdBy: 'agent02' },
  { id: 'APP-014', type: 'card', status: 'active', clientId: 'CL-1178', clientName: 'Сериков Данияр А.', productName: 'Visa Infinite', amount: 0, currency: 'KZT', createdAt: '2025-05-08', updatedAt: '2025-05-09', createdBy: 'agent03' },
  { id: 'APP-015', type: 'deposit', status: 'closed', clientId: 'CL-1089', clientName: 'Исаева Гулнора Х.', productName: 'Вклад «Рост» 3 мес.', amount: 1000000, currency: 'KZT', createdAt: '2025-02-01', updatedAt: '2025-05-01', createdBy: 'agent02', notes: 'Срок истёк' },
];

// ─── Type Badge ─────────────────────────────────────────────────

function TypeBadge({ type }: { type: Application['type'] }) {
  const config: Record<string, { label: string; className: string }> = {
    card:    { label: 'Карта',    className: 'bg-bank-red/10 text-bank-red border-bank-red/20' },
    credit:  { label: 'Кредит',  className: 'bg-bank-coal/10 text-bank-coal border-bank-coal/20' },
    deposit: { label: 'Депозит', className: 'bg-bank-warning/10 text-bank-warning border-bank-warning/20' },
  };
  const c = config[type];
  return <Badge variant="outline" className={`text-xs font-medium border ${c.className}`}>{c.label}</Badge>;
}

// ─── Column Definitions ─────────────────────────────────────────

const columns: ColumnDef<Application>[] = [
  { accessorKey: 'id', header: 'ID', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('id')}</span> },
  { accessorKey: 'clientName', header: 'Клиент', cell: ({ row }) => <span className="font-medium">{row.getValue('clientName')}</span> },
  { accessorKey: 'type', header: 'Тип', cell: ({ row }) => <TypeBadge type={row.getValue('type')} /> },
  { accessorKey: 'productName', header: 'Продукт', cell: ({ row }) => <span className="text-muted-foreground">{row.getValue('productName')}</span> },
  {
    accessorKey: 'amount',
    header: 'Сумма',
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number;
      return amount ? <span className="font-medium">{amount.toLocaleString('ru-RU')} ₸</span> : <span className="text-muted-foreground">—</span>;
    },
  },
  { accessorKey: 'status', header: 'Статус', cell: ({ row }) => <StatusBadge status={row.getValue('status')} /> },
  { accessorKey: 'createdAt', header: 'Дата', cell: ({ row }) => <span className="text-muted-foreground">{row.getValue('createdAt')}</span> },
];

// ─── Page Component ─────────────────────────────────────────────

export default function ApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredData = mockApplications.filter((app) => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    if (typeFilter !== 'all' && app.type !== typeFilter) return false;
    return true;
  });

  return (
    <PageContainer
      title="Заявки"
      subtitle="Управление банковскими заявками"
      actions={
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-bank-red px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-bank-red-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bank-red/40"
          onClick={() => alert('Создание новой заявки — функционал в разработке')}
        >
          <Plus className="h-4 w-4" />
          Новая заявка
        </button>
      }
    >
      {/* Filter Bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-full sm:w-[200px]">
            <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="pending">На рассмотрении</SelectItem>
            <SelectItem value="approved">Одобрено</SelectItem>
            <SelectItem value="rejected">Отклонено</SelectItem>
            <SelectItem value="active">Активен</SelectItem>
            <SelectItem value="closed">Закрыт</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-9 w-full sm:w-[180px]">
            <SelectValue placeholder="Тип" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            <SelectItem value="card">Карты</SelectItem>
            <SelectItem value="credit">Кредиты</SelectItem>
            <SelectItem value="deposit">Депозиты</SelectItem>
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

      {/* Data Table */}
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
