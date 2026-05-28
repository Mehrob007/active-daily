'use client';

import React, { useState, useMemo } from 'react';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  Filter,
  CreditCard,
  Landmark,
  Search,
} from 'lucide-react';

type CardType = 'debit' | 'credit' | 'prepaid';
type CardBrand = 'Visa' | 'Mastercard' | 'UzCard' | 'Humo';
type CardStatus = 'active' | 'pending' | 'blocked' | 'closed';
type DepositStatus = 'active' | 'pending' | 'completed' | 'closed';

interface CardItem {
  id: string;
  clientName: string;
  cardType: CardType;
  brand: CardBrand;
  lastFour: string;
  annualFee: number;
  cashbackPercent: number;
  status: CardStatus;
}

interface DepositItem {
  id: string;
  clientName: string;
  productName: string;
  amount: number;
  termMonths: number;
  interestRate: number;
  replenishable: boolean;
  status: DepositStatus;
}

const mockCards: CardItem[] = [
  { id: 'CD-001', clientName: 'Каримов Алишер Р.', cardType: 'debit', brand: 'Visa', lastFour: '4521', annualFee: 0, cashbackPercent: 1.5, status: 'active' },
  { id: 'CD-002', clientName: 'Рахимова Дилноза У.', cardType: 'credit', brand: 'Mastercard', lastFour: '7832', annualFee: 15000, cashbackPercent: 2.0, status: 'active' },
  { id: 'CD-003', clientName: 'Мирзаев Бекзод Т.', cardType: 'debit', brand: 'UzCard', lastFour: '1093', annualFee: 0, cashbackPercent: 1.0, status: 'active' },
  { id: 'CD-004', clientName: 'Сидорова Нодира А.', cardType: 'prepaid', brand: 'Visa', lastFour: '6654', annualFee: 0, cashbackPercent: 0, status: 'pending' },
  { id: 'CD-005', clientName: 'Турсунов Жасур К.', cardType: 'credit', brand: 'Mastercard', lastFour: '3398', annualFee: 25000, cashbackPercent: 3.0, status: 'active' },
  { id: 'CD-006', clientName: 'Умарова Зулфия М.', cardType: 'debit', brand: 'Humo', lastFour: '8821', annualFee: 0, cashbackPercent: 1.0, status: 'blocked' },
  { id: 'CD-007', clientName: 'Ахметов Санжар Б.', cardType: 'debit', brand: 'Visa', lastFour: '5547', annualFee: 5000, cashbackPercent: 2.0, status: 'active' },
  { id: 'CD-008', clientName: 'Исаева Гулнора Х.', cardType: 'credit', brand: 'Visa', lastFour: '2276', annualFee: 20000, cashbackPercent: 2.5, status: 'pending' },
  { id: 'CD-009', clientName: 'Назаров Тимур С.', cardType: 'debit', brand: 'UzCard', lastFour: '4410', annualFee: 0, cashbackPercent: 1.0, status: 'active' },
  { id: 'CD-010', clientName: 'Касымова Мухаббат Ж.', cardType: 'prepaid', brand: 'Mastercard', lastFour: '7763', annualFee: 0, cashbackPercent: 0, status: 'closed' },
  { id: 'CD-011', clientName: 'Бекетов Руслан Д.', cardType: 'credit', brand: 'Humo', lastFour: '1198', annualFee: 18000, cashbackPercent: 2.0, status: 'active' },
  { id: 'CD-012', clientName: 'Жумабаева Айдана К.', cardType: 'debit', brand: 'Visa', lastFour: '9935', annualFee: 5000, cashbackPercent: 1.5, status: 'active' },
];

const mockDeposits: DepositItem[] = [
  { id: 'DP-001', clientName: 'Каримов Алишер Р.', productName: 'Вклад «Надёжный» 12 мес.', amount: 5000000, termMonths: 12, interestRate: 14.5, replenishable: false, status: 'active' },
  { id: 'DP-002', clientName: 'Мирзаев Бекзод Т.', productName: 'Вклад «Рост» 6 мес.', amount: 2000000, termMonths: 6, interestRate: 13.0, replenishable: true, status: 'active' },
  { id: 'DP-003', clientName: 'Сидорова Нодира А.', productName: 'Вклад «Накопительный» 24 мес.', amount: 10000000, termMonths: 24, interestRate: 15.5, replenishable: true, status: 'active' },
  { id: 'DP-004', clientName: 'Турсунов Жасур К.', productName: 'Вклад «Премиум» 12 мес.', amount: 15000000, termMonths: 12, interestRate: 16.0, replenishable: false, status: 'pending' },
  { id: 'DP-005', clientName: 'Ахметов Санжар Б.', productName: 'Вклад «Рост» 3 мес.', amount: 1000000, termMonths: 3, interestRate: 12.0, replenishable: true, status: 'completed' },
  { id: 'DP-006', clientName: 'Исаева Гулнора Х.', productName: 'Вклад «Надёжный» 12 мес.', amount: 7500000, termMonths: 12, interestRate: 14.5, replenishable: false, status: 'active' },
  { id: 'DP-007', clientName: 'Жумабаева Айдана К.', productName: 'Вклад «Накопительный» 18 мес.', amount: 3000000, termMonths: 18, interestRate: 15.0, replenishable: true, status: 'pending' },
  { id: 'DP-008', clientName: 'Поляков Андрей В.', productName: 'Вклад «Пенсионный» 36 мес.', amount: 20000000, termMonths: 36, interestRate: 17.0, replenishable: true, status: 'closed' },
];

function CardTypeBadge({ type }: { type: CardType }) {
  const config: Record<CardType, { label: string; className: string }> = {
    debit:   { label: 'Дебетовая',  className: 'bg-bank-success/15 text-bank-success border-bank-success/20' },
    credit:  { label: 'Кредитная',  className: 'bg-bank-red/15 text-bank-red border-bank-red/20' },
    prepaid: { label: 'Предоплата', className: 'bg-bank-info/15 text-bank-info border-bank-info/20' },
  };
  const c = config[type];
  return (
    <Badge variant="outline" className={`text-xs font-medium border ${c.className}`}>
      {c.label}
    </Badge>
  );
}

function BrandBadge({ brand }: { brand: CardBrand }) {
  const config: Record<CardBrand, { className: string }> = {
    Visa:       { className: 'bg-blue-50 text-blue-700 border-blue-200' },
    Mastercard: { className: 'bg-orange-50 text-orange-700 border-orange-200' },
    UzCard:     { className: 'bg-green-50 text-green-700 border-green-200' },
    Humo:       { className: 'bg-purple-50 text-purple-700 border-purple-200' },
  };
  const c = config[brand];
  return (
    <Badge variant="outline" className={`text-xs font-medium border ${c.className}`}>
      {brand}
    </Badge>
  );
}

function ReplenishableBadge({ value }: { value: boolean }) {
  return value ? (
    <Badge variant="outline" className="text-xs font-medium bg-bank-success/15 text-bank-success border-bank-success/20">
      Да
    </Badge>
  ) : (
    <Badge variant="outline" className="text-xs font-medium bg-muted text-muted-foreground border-border/60">
      Нет
    </Badge>
  );
}

const cardColumns: ColumnDef<CardItem>[] = [
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
    accessorKey: 'cardType',
    header: 'Тип карты',
    cell: ({ row }) => <CardTypeBadge type={row.getValue('cardType')} />,
  },
  {
    accessorKey: 'brand',
    header: 'Платёжная система',
    cell: ({ row }) => <BrandBadge brand={row.getValue('brand')} />,
  },
  {
    accessorKey: 'annualFee',
    header: 'Годовое обслуживание',
    cell: ({ row }) => {
      const fee = row.getValue('annualFee') as number;
      return fee > 0 ? (
        <span className="font-medium">{fee.toLocaleString('ru-RU')} ₸</span>
      ) : (
        <span className="text-bank-success text-xs font-medium">Бесплатно</span>
      );
    },
  },
  {
    accessorKey: 'cashbackPercent',
    header: 'Кэшбэк',
    cell: ({ row }) => {
      const pct = row.getValue('cashbackPercent') as number;
      return pct > 0 ? (
        <span className="font-medium text-bank-red">{pct}%</span>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
  },
];

const depositColumns: ColumnDef<DepositItem>[] = [
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
    accessorKey: 'productName',
    header: 'Продукт',
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue('productName')}</span>
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
      <span className="text-center tabular-nums">{row.getValue('termMonths')}</span>
    ),
  },
  {
    accessorKey: 'interestRate',
    header: 'Ставка %',
    cell: ({ row }) => (
      <span className="font-medium text-bank-red">{row.getValue('interestRate')}%</span>
    ),
  },
  {
    accessorKey: 'replenishable',
    header: 'Пополнение',
    cell: ({ row }) => <ReplenishableBadge value={row.getValue('replenishable')} />,
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
  },
];

export default function CardsDepositsPage() {
  const [activeTab, setActiveTab] = useState<string>('cards');
  const [cardStatusFilter, setCardStatusFilter] = useState<string>('all');
  const [depositStatusFilter, setDepositStatusFilter] = useState<string>('all');

  const filteredCards = useMemo(() => {
    if (cardStatusFilter === 'all') return mockCards;
    return mockCards.filter((c) => c.status === cardStatusFilter);
  }, [cardStatusFilter]);

  const filteredDeposits = useMemo(() => {
    if (depositStatusFilter === 'all') return mockDeposits;
    return mockDeposits.filter((d) => d.status === depositStatusFilter);
  }, [depositStatusFilter]);

  return (
    <PageContainer
      title="Карты и депозиты"
      subtitle="Оформление и управление картами и вкладами"
      actions={
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-bank-red px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-bank-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bank-red/40"
          onClick={() =>
            alert(
              activeTab === 'cards'
                ? 'Новая заявка на карту — в разработке'
                : 'Новая заявка на депозит — в разработке'
            )
          }
        >
          <Plus className="h-4 w-4" />
          Новая заявка
        </button>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="cards" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Карты
          </TabsTrigger>
          <TabsTrigger value="deposits" className="gap-2">
            <Landmark className="h-4 w-4" />
            Депозиты
          </TabsTrigger>
        </TabsList>

        {}
        <TabsContent value="cards" className="space-y-4">
          {}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={cardStatusFilter} onValueChange={setCardStatusFilter}>
              <SelectTrigger className="h-9 w-full sm:w-[200px]">
                <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="pending">На рассмотрении</SelectItem>
                <SelectItem value="blocked">Заблокированные</SelectItem>
                <SelectItem value="closed">Закрытые</SelectItem>
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
            columns={cardColumns}
            data={filteredCards}
            searchKey="clientName"
            searchPlaceholder="Поиск по имени клиента..."
            pageSize={10}
          />
        </TabsContent>

        {}
        <TabsContent value="deposits" className="space-y-4">
          {}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={depositStatusFilter} onValueChange={setDepositStatusFilter}>
              <SelectTrigger className="h-9 w-full sm:w-[200px]">
                <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="pending">На рассмотрении</SelectItem>
                <SelectItem value="completed">Завершённые</SelectItem>
                <SelectItem value="closed">Закрытые</SelectItem>
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
            columns={depositColumns}
            data={filteredDeposits}
            searchKey="clientName"
            searchPlaceholder="Поиск по имени клиента..."
            pageSize={10}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
