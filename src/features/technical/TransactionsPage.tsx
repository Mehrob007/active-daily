import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { DataTable, StatusBadge } from '@/components/banking';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/stores/navigation-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColumnDef } from '@tanstack/react-table';
import type { Transaction } from '@/types';
import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Filter,
} from 'lucide-react';

// ─── Mock Data ──────────────────────────────────────────────────

const mockTransactions: Transaction[] = [
  { id: 'TXN-001', type: 'credit', amount: 250000, currency: 'KZT', status: 'completed', description: 'Зачисление зарплаты', createdAt: '2025-05-15 14:32', accountId: 'KZT-001-001' },
  { id: 'TXN-002', type: 'debit', amount: 45000, currency: 'KZT', status: 'completed', description: 'Оплата коммунальных услуг', createdAt: '2025-05-15 13:18', accountId: 'KZT-001-001' },
  { id: 'TXN-003', type: 'transfer', amount: 120000, currency: 'KZT', status: 'completed', description: 'Перевод Каримову А.Р.', createdAt: '2025-05-15 12:05', accountId: 'KZT-001-002' },
  { id: 'TXN-004', type: 'debit', amount: 18000, currency: 'KZT', status: 'pending', description: 'Покупка — Kaspi Store', createdAt: '2025-05-15 11:42', accountId: 'KZT-001-003' },
  { id: 'TXN-005', type: 'credit', amount: 500000, currency: 'KZT', status: 'completed', description: 'Возврат средств по кредиту', createdAt: '2025-05-14 16:30', accountId: 'KZT-002-001' },
  { id: 'TXN-006', type: 'transfer', amount: 75000, currency: 'KZT', status: 'failed', description: 'Перевод — недостаточно средств', createdAt: '2025-05-14 15:12', accountId: 'KZT-001-004' },
  { id: 'TXN-007', type: 'debit', amount: 3200, currency: 'USD', status: 'completed', description: 'Оплата онлайн-подписки', createdAt: '2025-05-14 10:55', accountId: 'KZT-001-005' },
  { id: 'TXN-008', type: 'credit', amount: 1500000, currency: 'KZT', status: 'pending', description: 'Зачисление с депозита', createdAt: '2025-05-14 09:00', accountId: 'KZT-003-001' },
  { id: 'TXN-009', type: 'debit', amount: 89000, currency: 'KZT', status: 'completed', description: 'Оплата в ресторане', createdAt: '2025-05-13 20:15', accountId: 'KZT-001-003' },
  { id: 'TXN-010', type: 'transfer', amount: 350000, currency: 'KZT', status: 'completed', description: 'Перевод между счетами', createdAt: '2025-05-13 17:45', accountId: 'KZT-001-006' },
  { id: 'TXN-011', type: 'credit', amount: 75000, currency: 'KZT', status: 'reversed', description: 'Возврат покупки — отменён заказ', createdAt: '2025-05-13 14:20', accountId: 'KZT-001-001' },
  { id: 'TXN-012', type: 'debit', amount: 225000, currency: 'KZT', status: 'completed', description: 'Погашение кредита — аннуитет', createdAt: '2025-05-12 08:00', accountId: 'KZT-002-001' },
  { id: 'TXN-013', type: 'transfer', amount: 50000, currency: 'KZT', status: 'completed', description: 'Перевод Рахимовой Д.У.', createdAt: '2025-05-12 15:30', accountId: 'KZT-001-007' },
  { id: 'TXN-014', type: 'credit', amount: 300000, currency: 'KZT', status: 'completed', description: 'Кэшбэк за май', createdAt: '2025-05-11 12:00', accountId: 'KZT-001-003' },
  { id: 'TXN-015', type: 'debit', amount: 15000, currency: 'KZT', status: 'failed', description: 'Попытка снятия — лимит превышен', createdAt: '2025-05-11 10:22', accountId: 'KZT-001-008' },
  { id: 'TXN-016', type: 'transfer', amount: 200000, currency: 'KZT', status: 'completed', description: 'Пополнение счёта телефона', createdAt: '2025-05-10 19:45', accountId: 'KZT-001-001' },
  { id: 'TXN-017', type: 'credit', amount: 420000, currency: 'KZT', status: 'completed', description: 'Зачисление от контрагента', createdAt: '2025-05-10 14:15', accountId: 'KZT-004-001' },
  { id: 'TXN-018', type: 'debit', amount: 56000, currency: 'KZT', status: 'completed', description: 'Покупка бытовой техники', createdAt: '2025-05-09 16:33', accountId: 'KZT-001-003' },
  { id: 'TXN-019', type: 'transfer', amount: 100000, currency: 'KZT', status: 'pending', description: 'Межбанковский перевод', createdAt: '2025-05-09 11:10', accountId: 'KZT-001-002' },
  { id: 'TXN-020', type: 'credit', amount: 68000, currency: 'KZT', status: 'completed', description: 'Проценты по депозиту', createdAt: '2025-05-08 09:00', accountId: 'KZT-003-001' },
];

// ─── Type Badge ─────────────────────────────────────────────────

function TypeBadge({ type }: { type: Transaction['type'] }) {
  const config: Record<string, { label: string; icon: React.ElementType; className: string }> = {
    credit:   { label: 'Зачисление', icon: ArrowDownLeft,   className: 'bg-bank-success/10 text-bank-success border-bank-success/20' },
    debit:    { label: 'Списание',    icon: ArrowUpRight,    className: 'bg-bank-red/10 text-bank-red border-bank-red/20' },
    transfer: { label: 'Перевод',     icon: ArrowLeftRight,  className: 'bg-bank-info/10 text-bank-info border-bank-info/20' },
  };
  const c = config[type];
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={`inline-flex items-center gap-1 text-xs font-medium border ${c.className}`}>
      <Icon className="h-3 w-3" />
      {c.label}
    </Badge>
  );
}

// ─── Column Definitions ─────────────────────────────────────────

const columns: ColumnDef<Transaction>[] = [
  { accessorKey: 'id', header: 'ID', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('id')}</span> },
  { accessorKey: 'type', header: 'Тип', cell: ({ row }) => <TypeBadge type={row.getValue('type')} /> },
  {
    accessorKey: 'amount',
    header: 'Сумма',
    cell: ({ row }) => {
      const tx = row.original;
      const prefix = tx.type === 'debit' ? '−' : '+';
      return <span className={`font-semibold ${tx.type === 'debit' ? 'text-bank-red' : 'text-bank-success'}`}>{prefix}{tx.amount.toLocaleString('ru-RU')} {tx.currency}</span>;
    },
  },
  { accessorKey: 'currency', header: 'Валюта', cell: ({ row }) => <span className="text-muted-foreground">{row.getValue('currency')}</span> },
  { accessorKey: 'status', header: 'Статус', cell: ({ row }) => <StatusBadge status={row.getValue('status')} /> },
  { accessorKey: 'description', header: 'Описание', cell: ({ row }) => <span className="max-w-[200px] truncate text-muted-foreground">{row.getValue('description')}</span> },
  { accessorKey: 'createdAt', header: 'Дата', cell: ({ row }) => <span className="text-muted-foreground whitespace-nowrap">{row.getValue('createdAt')}</span> },
];

// ─── Page Component ─────────────────────────────────────────────

export default function TransactionsPage() {
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const currentParams = useNavigationStore((state) => state.currentParams);

  useEffect(() => {
    if (currentParams && (currentParams.cardId || currentParams.accountId)) {
      setAccountNumber(currentParams.cardId || currentParams.accountId);
    }
  }, [currentParams]);

  const filteredData = mockTransactions.filter((tx) => {
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (accountNumber && !tx.accountId.toLowerCase().includes(accountNumber.toLowerCase())) return false;
    return true;
  });

  return (
    <PageContainer title="Поиск транзакций" subtitle="Универсальный поиск и фильтрация транзакций">
      {/* Search Form */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Номер счёта..." 
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="h-9 pl-8" 
          />
        </div>
        <Input type="date" className="h-9" />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Тип транзакции" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            <SelectItem value="credit">Зачисление</SelectItem>
            <SelectItem value="debit">Списание</SelectItem>
            <SelectItem value="transfer">Перевод</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="completed">Выполнен</SelectItem>
            <SelectItem value="pending">В обработке</SelectItem>
            <SelectItem value="failed">Ошибка</SelectItem>
            <SelectItem value="reversed">Возврат</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        searchKey="description"
        searchPlaceholder="Поиск по описанию..."
        pageSize={10}
      />
    </PageContainer>
  );
}
