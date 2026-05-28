'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { DataTable, StatusBadge } from '@/components/banking';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColumnDef } from '@tanstack/react-table';
import type { CardProduct, CreditProduct, DepositProduct } from '@/types';
import {
  Pencil,
  Plus,
  CreditCard,
  Banknote,
  Landmark,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mockCards: CardProduct[] = [
  { id: 'CRD-001', name: 'Visa Classic', type: 'debit', brand: 'visa', annualFee: 0, cashbackPercent: 0.5, isActive: true },
  { id: 'CRD-002', name: 'Visa Gold', type: 'debit', brand: 'visa', annualFee: 15000, cashbackPercent: 1.0, isActive: true },
  { id: 'CRD-003', name: 'Visa Platinum', type: 'debit', brand: 'visa', annualFee: 35000, cashbackPercent: 2.0, isActive: true },
  { id: 'CRD-004', name: 'Visa Infinite', type: 'debit', brand: 'visa', annualFee: 75000, cashbackPercent: 3.5, isActive: true },
  { id: 'CRD-005', name: 'Mastercard Standard', type: 'debit', brand: 'mastercard', annualFee: 0, cashbackPercent: 0.3, isActive: true },
  { id: 'CRD-006', name: 'Mastercard World', type: 'credit', brand: 'mastercard', annualFee: 25000, cashbackPercent: 1.5, minBalance: 500000, isActive: true },
  { id: 'CRD-007', name: 'UzCard Classic', type: 'debit', brand: 'uzcard', annualFee: 0, cashbackPercent: 0, isActive: true },
  { id: 'CRD-008', name: 'Humo Premium', type: 'debit', brand: 'humo', annualFee: 10000, cashbackPercent: 0.8, isActive: true },
  { id: 'CRD-009', name: 'Visa Business', type: 'credit', brand: 'visa', annualFee: 50000, cashbackPercent: 2.5, minBalance: 1000000, isActive: false },
  { id: 'CRD-010', name: 'Mastercard Prepaid', type: 'prepaid', brand: 'mastercard', annualFee: 5000, cashbackPercent: 0, isActive: false },
];

const mockCredits: CreditProduct[] = [
  { id: 'CRT-001', name: 'Экспресс-кредит', minAmount: 100000, maxAmount: 2000000, minTerm: 3, maxTerm: 36, interestRate: 18.5, isActive: true },
  { id: 'CRT-002', name: 'Потребительский кредит', minAmount: 300000, maxAmount: 10000000, minTerm: 6, maxTerm: 60, interestRate: 14.0, isActive: true },
  { id: 'CRT-003', name: 'Автокредит', minAmount: 1000000, maxAmount: 30000000, minTerm: 12, maxTerm: 84, interestRate: 11.5, isActive: true },
  { id: 'CRT-004', name: 'Ипотека', minAmount: 5000000, maxAmount: 100000000, minTerm: 36, maxTerm: 300, interestRate: 9.0, isActive: true },
  { id: 'CRT-005', name: 'Образовательный кредит', minAmount: 200000, maxAmount: 5000000, minTerm: 12, maxTerm: 60, interestRate: 7.5, isActive: true },
  { id: 'CRT-006', name: 'Рефинансирование', minAmount: 500000, maxAmount: 15000000, minTerm: 6, maxTerm: 84, interestRate: 12.0, isActive: true },
  { id: 'CRT-007', name: 'Кредит на бизнес', minAmount: 1000000, maxAmount: 50000000, minTerm: 12, maxTerm: 60, interestRate: 13.5, isActive: true },
  { id: 'CRT-008', name: 'Кредитная карта (овердрафт)', minAmount: 50000, maxAmount: 3000000, minTerm: 1, maxTerm: 12, interestRate: 22.0, isActive: false },
];

const mockDeposits: DepositProduct[] = [
  { id: 'DPS-001', name: 'Вклад «Надёжный»', minAmount: 100000, maxAmount: 50000000, minTerm: 3, maxTerm: 24, interestRate: 10.5, isReplenishable: false, isActive: true },
  { id: 'DPS-002', name: 'Вклад «Рост»', minAmount: 50000, maxAmount: 30000000, minTerm: 1, maxTerm: 12, interestRate: 12.0, isReplenishable: true, isActive: true },
  { id: 'DPS-003', name: 'Вклад «Свобода»', minAmount: 200000, maxAmount: 100000000, minTerm: 6, maxTerm: 36, interestRate: 11.0, isReplenishable: true, isActive: true },
  { id: 'DPS-004', name: 'Накопительный счёт', minAmount: 10000, maxAmount: 10000000, minTerm: 1, maxTerm: 0, interestRate: 8.0, isReplenishable: true, isActive: true },
  { id: 'DPS-005', name: 'Вклад «Пенсионный»', minAmount: 50000, maxAmount: 20000000, minTerm: 12, maxTerm: 60, interestRate: 13.5, isReplenishable: false, isActive: true },
  { id: 'DPS-006', name: 'Вклад «Детский»', minAmount: 10000, maxAmount: 5000000, minTerm: 12, maxTerm: 216, interestRate: 14.0, isReplenishable: true, isActive: true },
];

function BrandBadge({ brand }: { brand: string }) {
  const config: Record<string, string> = {
    visa: 'bg-blue-50 text-blue-700 border-blue-200',
    mastercard: 'bg-orange-50 text-orange-700 border-orange-200',
    uzcard: 'bg-green-50 text-green-700 border-green-200',
    humo: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  };
  return (
    <Badge variant="outline" className={cn('text-xs font-medium border', config[brand] ?? 'bg-gray-50 text-gray-600 border-gray-200')}>
      {brand.toUpperCase()}
    </Badge>
  );
}

function ActiveToggle({ active }: { active: boolean }) {
  const Icon = active ? ToggleRight : ToggleLeft;
  return (
    <div className="flex items-center gap-1.5">
      <Icon className={cn('h-4 w-4', active ? 'text-bank-success' : 'text-muted-foreground')} />
      <span className={cn('text-xs font-medium', active ? 'text-bank-success' : 'text-muted-foreground')}>
        {active ? 'Активен' : 'Отключён'}
      </span>
    </div>
  );
}

function EditButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 gap-1.5 text-bank-red hover:bg-bank-active hover:text-bank-red"
      onClick={() => alert('Редактирование продукта — функционал в разработке')}
    >
      <Pencil className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Редактировать</span>
    </Button>
  );
}

const cardColumns: ColumnDef<CardProduct>[] = [
  { accessorKey: 'id', header: 'ID', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('id')}</span> },
  { accessorKey: 'name', header: 'Название', cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span> },
  {
    accessorKey: 'type',
    header: 'Тип',
    cell: ({ row }) => {
      const typeLabels: Record<string, string> = { debit: 'Дебетовая', credit: 'Кредитная', prepaid: 'Предоплаченная' };
      return <Badge variant="secondary" className="text-xs">{typeLabels[row.getValue('type')] ?? row.getValue('type')}</Badge>;
    },
  },
  { accessorKey: 'brand', header: 'Платёжная система', cell: ({ row }) => <BrandBadge brand={row.getValue('brand')} /> },
  {
    accessorKey: 'annualFee',
    header: 'Годовая плата',
    cell: ({ row }) => {
      const fee = row.getValue('annualFee') as number;
      return fee > 0 ? <span>{fee.toLocaleString('ru-RU')} ₸</span> : <span className="text-bank-success font-medium">Бесплатно</span>;
    },
  },
  { accessorKey: 'cashbackPercent', header: 'Кэшбэк', cell: ({ row }) => <span className="font-medium">{row.getValue('cashbackPercent')}%</span> },
  { accessorKey: 'isActive', header: 'Статус', cell: ({ row }) => <ActiveToggle active={row.getValue('isActive')} /> },
  { id: 'actions', header: '', cell: () => <EditButton /> },
];

const creditColumns: ColumnDef<CreditProduct>[] = [
  { accessorKey: 'id', header: 'ID', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('id')}</span> },
  { accessorKey: 'name', header: 'Название', cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span> },
  {
    accessorKey: 'minAmount',
    header: 'Мин. сумма',
    cell: ({ row }) => <span>{(row.getValue('minAmount') as number).toLocaleString('ru-RU')} ₸</span>,
  },
  {
    accessorKey: 'maxAmount',
    header: 'Макс. сумма',
    cell: ({ row }) => <span className="font-medium">{(row.getValue('maxAmount') as number).toLocaleString('ru-RU')} ₸</span>,
  },
  {
    accessorKey: 'interestRate',
    header: 'Ставка',
    cell: ({ row }) => <span className="font-semibold text-bank-red">{row.getValue('interestRate')}%</span>,
  },
  {
    accessorKey: 'maxTerm',
    header: 'Макс. срок',
    cell: ({ row }) => <span className="text-muted-foreground">до {row.getValue('maxTerm')} мес.</span>,
  },
  { accessorKey: 'isActive', header: 'Статус', cell: ({ row }) => <ActiveToggle active={row.getValue('isActive')} /> },
  { id: 'actions', header: '', cell: () => <EditButton /> },
];

const depositColumns: ColumnDef<DepositProduct>[] = [
  { accessorKey: 'id', header: 'ID', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('id')}</span> },
  { accessorKey: 'name', header: 'Название', cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span> },
  {
    accessorKey: 'minAmount',
    header: 'Мин. сумма',
    cell: ({ row }) => <span>{(row.getValue('minAmount') as number).toLocaleString('ru-RU')} ₸</span>,
  },
  {
    accessorKey: 'maxAmount',
    header: 'Макс. сумма',
    cell: ({ row }) => <span className="font-medium">{(row.getValue('maxAmount') as number).toLocaleString('ru-RU')} ₸</span>,
  },
  {
    accessorKey: 'interestRate',
    header: 'Ставка',
    cell: ({ row }) => <span className="font-semibold text-bank-success">{row.getValue('interestRate')}%</span>,
  },
  {
    accessorKey: 'isReplenishable',
    header: 'Пополнение',
    cell: ({ row }) => (
      <span className={row.getValue('isReplenishable') ? 'text-bank-success font-medium' : 'text-muted-foreground'}>
        {row.getValue('isReplenishable') ? 'Да' : 'Нет'}
      </span>
    ),
  },
  { accessorKey: 'isActive', header: 'Статус', cell: ({ row }) => <ActiveToggle active={row.getValue('isActive')} /> },
  { id: 'actions', header: '', cell: () => <EditButton /> },
];

export default function ProductsPage() {
  return (
    <PageContainer
      title="Каталог продуктов"
      subtitle="Банковские продукты и тарифы"
      actions={
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-bank-red px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-bank-red-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bank-red/40"
          onClick={() => alert('Создание нового продукта — функционал в разработке')}
        >
          <Plus className="h-4 w-4" />
          Новый продукт
        </button>
      }
    >
      <Tabs defaultValue="cards" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 sm:w-[400px]">
          <TabsTrigger value="cards" className="gap-1.5 text-xs sm:text-sm">
            <CreditCard className="h-3.5 w-3.5" />
            Карты
          </TabsTrigger>
          <TabsTrigger value="credits" className="gap-1.5 text-xs sm:text-sm">
            <Banknote className="h-3.5 w-3.5" />
            Кредиты
          </TabsTrigger>
          <TabsTrigger value="deposits" className="gap-1.5 text-xs sm:text-sm">
            <Landmark className="h-3.5 w-3.5" />
            Депозиты
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cards">
          <DataTable
            columns={cardColumns}
            data={mockCards}
            searchKey="name"
            searchPlaceholder="Поиск по карте..."
            pageSize={8}
          />
        </TabsContent>

        <TabsContent value="credits">
          <DataTable
            columns={creditColumns}
            data={mockCredits}
            searchKey="name"
            searchPlaceholder="Поиск по кредиту..."
            pageSize={8}
          />
        </TabsContent>

        <TabsContent value="deposits">
          <DataTable
            columns={depositColumns}
            data={mockDeposits}
            searchKey="name"
            searchPlaceholder="Поиск по вкладу..."
            pageSize={8}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
