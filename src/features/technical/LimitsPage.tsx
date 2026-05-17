'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { DataTable, StatusBadge } from '@/components/banking';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { ColumnDef } from '@tanstack/react-table';
import { useNavigationStore } from '@/stores/navigation-store';
import {
  Shield,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Save,
  RefreshCcw,
  Clock,
  User,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  History,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────

interface LimitEntry {
  dailyTransfer: number;
  monthlyTransfer: number;
  dailyWithdrawal: number;
  monthlyWithdrawal: number;
}

interface LimitHistoryEntry {
  id: string;
  date: string;
  changedBy: string;
  field: string;
  oldValue: string;
  newValue: string;
  reason: string;
}

interface LimitCardData {
  key: keyof LimitEntry;
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

// ─── Mock Data ──────────────────────────────────────────────────

const MOCK_CURRENT_LIMITS: LimitEntry = {
  dailyTransfer: 5_000_000,
  monthlyTransfer: 30_000_000,
  dailyWithdrawal: 1_000_000,
  monthlyWithdrawal: 10_000_000,
};

const MOCK_LIMIT_HISTORY: LimitHistoryEntry[] = [
  { id: 'LH-001', date: '2025-05-15 14:32', changedBy: 'Абдуллаев М.К.', field: 'Дневной перевод', oldValue: '3 000 000 ₸', newValue: '5 000 000 ₸', reason: 'Повышение по запросу клиента, подтверждено руководителем' },
  { id: 'LH-002', date: '2025-05-12 10:15', changedBy: 'Каримова Г.А.', field: 'Месячный перевод', oldValue: '20 000 000 ₸', newValue: '30 000 000 ₸', reason: 'Бизнес-клиент, увеличен лимит для корпоративных операций' },
  { id: 'LH-003', date: '2025-05-10 09:45', changedBy: 'Турсунов Б.Р.', field: 'Дневное снятие', oldValue: '500 000 ₸', newValue: '1 000 000 ₸', reason: 'По заявлению клиента CL-1042 от 08.05.2025' },
  { id: 'LH-004', date: '2025-05-05 16:20', changedBy: 'Рахимова Д.У.', field: 'Месячное снятие', oldValue: '5 000 000 ₸', newValue: '10 000 000 ₸', reason: 'Согласовано с отделом комплаенса, клиент высокого уровня' },
  { id: 'LH-005', date: '2025-04-28 11:00', changedBy: 'Абдуллаев М.К.', field: 'Дневной перевод', oldValue: '2 000 000 ₸', newValue: '3 000 000 ₸', reason: 'Ежеквартальный пересмотр лимитов по регламенту' },
  { id: 'LH-006', date: '2025-04-20 13:45', changedBy: 'Каримова Г.А.', field: 'Месячный перевод', oldValue: '15 000 000 ₸', newValue: '20 000 000 ₸', reason: 'Увеличение оборотов клиента за последний квартал' },
  { id: 'LH-007', date: '2025-04-15 08:30', changedBy: 'Турсунов Б.Р.', field: 'Дневное снятие', oldValue: '300 000 ₸', newValue: '500 000 ₸', reason: 'Стандартное повышение по классу обслуживания' },
  { id: 'LH-010', date: '2025-03-20 12:40', changedBy: 'Каримова Г.А.', field: 'Месячный перевод', oldValue: '10 000 000 ₸', newValue: '15 000 000 ₸', reason: 'Запрос от филиала №12, согласовано руководителем' },
  { id: 'LH-011', date: '2025-03-15 09:20', changedBy: 'Турсунов Б.Р.', field: 'Дневное снятие', oldValue: '200 000 ₸', newValue: '300 000 ₸', reason: 'Первоначальная установка при открытии счёта' },
  { id: 'LH-012', date: '2025-03-10 14:05', changedBy: 'Рахимова Д.У.', field: 'Месячное снятие', oldValue: '2 000 000 ₸', newValue: '3 000 000 ₸', reason: 'Начальная установка лимитов для нового клиента' },
];

// ─── Helpers ────────────────────────────────────────────────────

function formatKZT(value: number): string {
  return value.toLocaleString('ru-RU') + ' ₸';
}

function parseKZT(value: string): number {
  return parseInt(value.replace(/\D/g, ''), 10) || 0;
}

// ─── Limit Card ─────────────────────────────────────────────────

function LimitCard({ title, value, icon, color, bgColor }: LimitCardData) {
  return (
    <Card className="rounded-lg border border-border/60 bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="flex items-start gap-4 p-5">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: bgColor }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground truncate">{title}</p>
          <p className="text-xl font-bold tracking-tight text-foreground mt-0.5">
            {formatKZT(value)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── History Columns ────────────────────────────────────────────

const historyColumns: ColumnDef<LimitHistoryEntry>[] = [
  {
    accessorKey: 'date',
    header: 'Дата',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Clock className="size-3.5 text-muted-foreground shrink-0" />
        <span className="text-sm whitespace-nowrap">{row.getValue('date')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'changedBy',
    header: 'Изменил',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <User className="size-3.5 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium">{row.getValue('changedBy')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'field',
    header: 'Поле',
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs font-medium whitespace-nowrap">
        {row.getValue('field')}
      </Badge>
    ),
  },
  {
    accessorKey: 'oldValue',
    header: 'Старое значение',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground line-through">
        {row.getValue('oldValue')}
      </span>
    ),
  },
  {
    accessorKey: 'newValue',
    header: 'Новое значение',
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-bank-success">
        {row.getValue('newValue')}
      </span>
    ),
  },
  {
    accessorKey: 'reason',
    header: 'Причина',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground max-w-xs truncate block" title={row.getValue('reason')}>
        {row.getValue('reason')}
      </span>
    ),
  },
];

// ─── Page Component ─────────────────────────────────────────────

export default function LimitsPage() {
  const [clientId, setClientId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentLimits, setCurrentLimits] = useState<LimitEntry>(MOCK_CURRENT_LIMITS);
  const [editLimits, setEditLimits] = useState<LimitEntry>({ ...MOCK_CURRENT_LIMITS });
  const [reason, setReason] = useState('');

  const currentParams = useNavigationStore((state) => state.currentParams);

  useEffect(() => {
    if (currentParams) {
      if (currentParams.clientId) {
        setClientId(currentParams.clientId);
      }
      if (currentParams.cardId || currentParams.accountId) {
        setAccountId(currentParams.cardId || currentParams.accountId);
      }
      // If we have clientId, trigger auto-load
      if (currentParams.clientId) {
        setIsLoaded(true);
        setEditLimits({ ...MOCK_CURRENT_LIMITS });
        setReason('');
        setShowSuccess(false);
      }
    }
  }, [currentParams]);

  const handleLoad = () => {
    if (!clientId.trim()) return;
    setIsLoaded(true);
    setEditLimits({ ...currentLimits });
    setReason('');
    setShowSuccess(false);
  };

  const handleReset = () => {
    setEditLimits({ ...currentLimits });
    setReason('');
    setShowSuccess(false);
  };

  const handleSave = () => {
    if (!reason.trim()) return;
    setIsSaving(true);

    setTimeout(() => {
      setCurrentLimits({ ...editLimits });
      setIsSaving(false);
      setShowSuccess(true);
      setReason('');

      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  const limitFields: {
    key: keyof LimitEntry;
    title: string;
    placeholder: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
  }[] = [
    {
      key: 'dailyTransfer',
      title: 'Дневной перевод',
      placeholder: 'Например: 5 000 000',
      icon: <TrendingUp className="size-5" />,
      color: '#C8102E',
      bgColor: '#FFE5EA',
    },
    {
      key: 'monthlyTransfer',
      title: 'Месячный перевод',
      placeholder: 'Например: 30 000 000',
      icon: <ArrowUpRight className="size-5" />,
      color: '#0EA5E9',
      bgColor: '#E0F2FE',
    },
    {
      key: 'dailyWithdrawal',
      title: 'Дневное снятие',
      placeholder: 'Например: 1 000 000',
      icon: <TrendingDown className="size-5" />,
      color: '#F59E0B',
      bgColor: '#FEF3C7',
    },
    {
      key: 'monthlyWithdrawal',
      title: 'Месячное снятие',
      placeholder: 'Например: 10 000 000',
      icon: <ArrowDownLeft className="size-5" />,
      color: '#16A34A',
      bgColor: '#DCFCE7',
    },
  ];

  return (
    <PageContainer
      title="Лимиты"
      subtitle="Управление лимитами и ограничениями клиентов"
      actions={
        isLoaded && (
          <div className="flex items-center gap-2">
            {showSuccess && (
              <div className="flex items-center gap-2 text-bank-success text-sm font-medium animate-in fade-in slide-in-from-right">
                <CheckCircle2 className="size-4" />
                Сохранено
              </div>
            )}
          </div>
        )
      }
    >
      {/* ── Client/Account Selector ── */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <Label htmlFor="client-id" className="text-sm font-medium mb-1.5 block">
              ID клиента
            </Label>
            <div className="relative">
              <User className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                id="client-id"
                placeholder="CL-1042"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="h-10 pl-9"
              />
            </div>
          </div>
          <div className="flex-1 w-full">
            <Label htmlFor="account-id" className="text-sm font-medium mb-1.5 block">
              ID счёта / карты
            </Label>
            <div className="relative">
              <CreditCard className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                id="account-id"
                placeholder="ACC-001"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="h-10 pl-9"
              />
            </div>
          </div>
          <Button
            onClick={handleLoad}
            disabled={!clientId.trim()}
            className="h-10 gap-2 bg-bank-red text-white hover:bg-bank-red/90 shrink-0"
          >
            <Search className="size-4" />
            Загрузить
          </Button>
        </div>
      </div>

      {!isLoaded ? (
        /* ── Placeholder ── */
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <div className="flex size-20 items-center justify-center rounded-full bg-bank-active mb-6">
            <Shield className="size-10 text-bank-red" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Выберите клиента
          </h3>
          <p className="text-sm max-w-md text-center">
            Введите ID клиента для просмотра и редактирования текущих лимитов
          </p>
        </div>
      ) : (
        /* ── Loaded Content ── */
        <div className="space-y-6">
          {/* Current Limits Display */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="size-5 text-bank-coal" />
              <h2 className="text-base font-semibold text-bank-coal">
                Текущие лимиты
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {limitFields.map((field) => (
                <LimitCard
                  key={field.key}
                  {...field}
                  value={currentLimits[field.key]}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Edit Form */}
          <div className="rounded-lg border border-border/60 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Wallet className="size-5 text-bank-coal" />
              <h2 className="text-base font-semibold text-bank-coal">
                Изменение лимитов
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {limitFields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label
                    htmlFor={`limit-${field.key}`}
                    className="text-sm font-medium text-foreground"
                  >
                    {field.title}
                  </Label>
                  <Input
                    id={`limit-${field.key}`}
                    type="text"
                    placeholder={field.placeholder}
                    value={editLimits[field.key].toLocaleString('ru-RU')}
                    onChange={(e) => {
                      const parsed = parseKZT(e.target.value);
                      setEditLimits((prev) => ({
                        ...prev,
                        [field.key]: parsed,
                      }));
                    }}
                    className="h-10 font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Текущее: {formatKZT(currentLimits[field.key])}
                  </p>
                </div>
              ))}
            </div>

            {/* Reason */}
            <div className="mb-5">
              <Label
                htmlFor="limit-reason"
                className="text-sm font-medium text-foreground mb-1.5 block"
              >
                Причина изменения <span className="text-bank-red">*</span>
              </Label>
              <Textarea
                id="limit-reason"
                placeholder="Укажите причину изменения лимитов (обязательное поле для аудита)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[80px] resize-y"
              />
              {!reason.trim() && (
                <p className="text-xs text-bank-red mt-1 flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  Поле «Причина изменения» обязательно для заполнения
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleReset}
                className="gap-2"
              >
                <RefreshCcw className="size-4" />
                Сбросить
              </Button>
              <Button
                onClick={handleSave}
                disabled={!reason.trim() || isSaving}
                className="gap-2 bg-bank-red text-white hover:bg-bank-red/90"
              >
                {isSaving ? (
                  <>
                    <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Сохранить лимиты
                  </>
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* History Table */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <History className="size-5 text-bank-coal" />
              <h2 className="text-base font-semibold text-bank-coal">
                История изменений лимитов
              </h2>
              <Badge variant="outline" className="text-xs ml-auto">
                {MOCK_LIMIT_HISTORY.length} записей
              </Badge>
            </div>
            <DataTable
              columns={historyColumns}
              data={MOCK_LIMIT_HISTORY}
              pageSize={10}
              searchKey="changedBy"
              searchPlaceholder="Поиск по сотруднику..."
              emptyMessage="История изменений пуста"
            />
          </div>
        </div>
      )}
    </PageContainer>
  );
}
