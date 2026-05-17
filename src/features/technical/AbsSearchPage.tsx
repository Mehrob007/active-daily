'use client';

import React, { useState, useMemo } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { DataTable, StatusBadge, KPICard } from '@/components/banking';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ColumnDef } from '@tanstack/react-table';
import {
  Search,
  User,
  CreditCard,
  Phone,
  FileText,
  Wallet,
  Building2,
  CalendarDays,
  Hash,
  UserCheck,
  UserX,
  ArrowRight,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────

type SearchType = 'passport' | 'phone' | 'account' | 'name';

interface ClientAccount {
  number: string;
  type: 'current' | 'savings' | 'card' | 'deposit';
  balance: number;
  currency: string;
  status: 'active' | 'blocked' | 'closed';
}

interface Client {
  id: string;
  fullName: string;
  passport: string;
  phone: string;
  birthDate: string;
  status: 'active' | 'blocked' | 'closed';
  accounts: ClientAccount[];
}

// ─── Mock Clients ───────────────────────────────────────────────

const MOCK_CLIENTS: Client[] = [
  {
    id: 'CL-1042',
    fullName: 'Каримов Алишер Рустамович',
    passport: '123456789',
    phone: '998901234567',
    birthDate: '15.03.1988',
    status: 'active',
    accounts: [
      { number: 'KZ01 3012 0000 0001 2345', type: 'current', balance: 1847500, currency: 'KZT', status: 'active' },
      { number: 'KZ01 3012 0000 0003 6789', type: 'card', balance: 432000, currency: 'KZT', status: 'active' },
      { number: 'KZ01 3012 0000 0005 1122', type: 'savings', balance: 5200000, currency: 'KZT', status: 'active' },
      { number: 'KZ01 3012 0000 0008 3344', type: 'deposit', balance: 10000000, currency: 'KZT', status: 'active' },
    ],
  },
  {
    id: 'CL-1098',
    fullName: 'Рахимова Дилноза Улугбековна',
    passport: '987654321',
    phone: '998901234567',
    birthDate: '22.07.1992',
    status: 'active',
    accounts: [
      { number: 'KZ01 3012 0000 0012 8901', type: 'current', balance: 670000, currency: 'KZT', status: 'active' },
      { number: 'KZ01 3012 0000 0015 2345', type: 'card', balance: 125000, currency: 'KZT', status: 'active' },
      { number: 'KZ01 3012 0000 0019 6780', type: 'deposit', balance: 3500000, currency: 'KZT', status: 'active' },
    ],
  },
  {
    id: 'CL-1056',
    fullName: 'Каримов Бекзод Турсунович',
    passport: '456123789',
    phone: '998907654321',
    birthDate: '08.11.1985',
    status: 'active',
    accounts: [
      { number: 'KZ01 3012 0000 0022 4567', type: 'current', balance: 2890000, currency: 'KZT', status: 'active' },
      { number: 'KZ01 3012 0000 0025 8901', type: 'card', balance: 890000, currency: 'KZT', status: 'active' },
      { number: 'KZ01 3012 0000 0028 1234', type: 'savings', balance: 7500000, currency: 'KZT', status: 'active' },
      { number: 'KZ01 3012 0000 0030 5678', type: 'card', balance: 45000, currency: 'KZT', status: 'blocked' },
      { number: 'KZ01 3012 0000 0033 9012', type: 'deposit', balance: 15000000, currency: 'KZT', status: 'active' },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────

function formatKZT(amount: number): string {
  return amount.toLocaleString('ru-RU') + ' ₸';
}

const SEARCH_TYPE_OPTIONS: { value: SearchType; label: string; icon: React.ReactNode }[] = [
  { value: 'passport', label: 'Паспорт', icon: <FileText className="size-4" /> },
  { value: 'phone', label: 'Телефон', icon: <Phone className="size-4" /> },
  { value: 'account', label: 'Счёт', icon: <CreditCard className="size-4" /> },
  { value: 'name', label: 'ФИО', icon: <User className="size-4" /> },
];

// ─── Account Columns ────────────────────────────────────────────

const accountColumns: ColumnDef<ClientAccount>[] = [
  {
    accessorKey: 'number',
    header: 'Номер счёта',
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.getValue('number')}</span>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Тип',
    cell: ({ row }) => <StatusBadge status={row.getValue('type')} />,
  },
  {
    accessorKey: 'balance',
    header: 'Баланс',
    cell: ({ row }) => (
      <span className="font-semibold tabular-nums">
        {formatKZT(row.getValue('balance'))}
      </span>
    ),
  },
  {
    accessorKey: 'currency',
    header: 'Валюта',
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs font-medium">
        {row.getValue('currency')}
      </Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
  },
];

// ─── Search Type Radio ──────────────────────────────────────────

function SearchTypeSelector({
  value,
  onChange,
}: {
  value: SearchType;
  onChange: (v: SearchType) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SEARCH_TYPE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
            value === opt.value
              ? 'border-bank-red bg-bank-active text-bank-red'
              : 'border-border/60 bg-white text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          }`}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Placeholder State ──────────────────────────────────────────

function PlaceholderState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
      <div className="flex size-20 items-center justify-center rounded-full bg-bank-active mb-6">
        <Search className="size-10 text-bank-red" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        Поиск клиента в ABS
      </h3>
      <p className="text-sm max-w-md text-center">
        Введите данные для поиска по паспорту, телефону, номеру счёта или ФИО клиента
      </p>
    </div>
  );
}

// ─── Not Found State ────────────────────────────────────────────

function NotFoundState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
      <div className="flex size-20 items-center justify-center rounded-full bg-muted mb-6">
        <UserX className="size-10 text-muted-foreground/60" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        Клиент не найден
      </h3>
      <p className="text-sm max-w-md text-center">
        По запросу «{query}» ничего не найдено. Проверьте введённые данные и повторите поиск.
      </p>
    </div>
  );
}

// ─── Client Info Card ───────────────────────────────────────────

function ClientInfoCard({ client }: { client: Client }) {
  return (
    <div className="rounded-lg border border-border/60 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-bank-active">
            <User className="size-6 text-bank-red" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {client.fullName}
            </h3>
            <p className="text-sm text-muted-foreground font-mono">
              {client.id}
            </p>
          </div>
        </div>
        <StatusBadge status={client.status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoItem
          icon={<FileText className="size-4" />}
          label="Паспорт"
          value={client.passport}
        />
        <InfoItem
          icon={<Phone className="size-4" />}
          label="Телефон"
          value={`+${client.phone}`}
        />
        <InfoItem
          icon={<CalendarDays className="size-4" />}
          label="Дата рождения"
          value={client.birthDate}
        />
        <InfoItem
          icon={<Building2 className="size-4" />}
          label="Статус"
          value={client.status === 'active' ? 'Активный клиент' : 'Неактивный'}
        />
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

// ─── Client Summary ─────────────────────────────────────────────

function ClientSummary({ client }: { client: Client }) {
  const totalBalance = client.accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const activeAccounts = client.accounts.filter((a) => a.status === 'active').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <KPICard
        title="Общий баланс"
        value={formatKZT(totalBalance)}
        icon={Wallet}
        className="rounded-lg border border-border/60"
      />
      <KPICard
        title="Количество счетов"
        value={client.accounts.length}
        icon={CreditCard}
        className="rounded-lg border border-border/60"
      />
      <KPICard
        title="Активные продукты"
        value={activeAccounts}
        icon={UserCheck}
        className="rounded-lg border border-border/60"
      />
    </div>
  );
}

// ─── Page Component ─────────────────────────────────────────────

export default function AbsSearchPage() {
  const [searchType, setSearchType] = useState<SearchType>('passport');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResult, setSearchResult] = useState<Client | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(false);
    setSearchResult(null);

    // Simulate API delay
    setTimeout(() => {
      const query = searchQuery.trim().toLowerCase();
      const found = MOCK_CLIENTS.find((c) => {
        switch (searchType) {
          case 'passport':
            return c.passport === query || c.passport.includes(query);
          case 'phone':
            return c.phone.includes(query);
          case 'account':
            return c.accounts.some((a) => a.number.toLowerCase().includes(query));
          case 'name':
            return (
              c.fullName.toLowerCase().includes(query) ||
              c.fullName.split(' ').some((part) => part.toLowerCase().startsWith(query))
            );
          default:
            return false;
        }
      });

      setSearchResult(found ?? null);
      setHasSearched(true);
      setIsSearching(false);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const searchPlaceholder = {
    passport: 'Введите номер паспорта...',
    phone: 'Введите номер телефона...',
    account: 'Введите номер счёта...',
    name: 'Введите ФИО клиента...',
  };

  return (
    <PageContainer
      title="ABS поиск"
      subtitle="Поиск клиентов по банковской системе ABS"
    >
      {/* ── Search Section ── */}
      <div className="mb-6 space-y-4">
        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">
            Тип поиска
          </Label>
          <SearchTypeSelector value={searchType} onChange={setSearchType} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute left-3 top-1/2 size-5 -translate-y-1/2" />
            <Input
              placeholder={searchPlaceholder[searchType]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-12 pl-11 text-base"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isSearching}
            className="h-12 gap-2 bg-bank-red px-8 text-white hover:bg-bank-red/90 shrink-0"
          >
            {isSearching ? (
              <>
                <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Поиск...
              </>
            ) : (
              <>
                <Search className="size-4" />
                Найти
              </>
            )}
          </Button>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* ── Results Section ── */}
      {!hasSearched && !isSearching && <PlaceholderState />}

      {isSearching && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="size-10 animate-spin rounded-full border-2 border-bank-red/20 border-t-bank-red mb-4" />
          <p className="text-sm">Поиск в системе ABS...</p>
        </div>
      )}

      {hasSearched && !searchResult && !isSearching && (
        <NotFoundState query={searchQuery} />
      )}

      {searchResult && !isSearching && (
        <div className="space-y-6">
          {/* Client Info */}
          <ClientInfoCard client={searchResult} />

          {/* Summary KPIs */}
          <ClientSummary client={searchResult} />

          {/* Accounts Table */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="size-5 text-bank-coal" />
              <h2 className="text-base font-semibold text-bank-coal">
                Счета клиента
              </h2>
              <Badge variant="outline" className="text-xs ml-auto">
                {searchResult.accounts.length} {searchResult.accounts.length === 1 ? 'счёт' : searchResult.accounts.length < 5 ? 'счёта' : 'счетов'}
              </Badge>
            </div>
            <DataTable
              columns={accountColumns}
              data={searchResult.accounts}
              pageSize={10}
              searchKey="number"
              searchPlaceholder="Поиск по номеру счёта..."
              emptyMessage="У клиента нет счетов"
            />
          </div>
        </div>
      )}
    </PageContainer>
  );
}
