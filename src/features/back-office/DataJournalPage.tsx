'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { DataTable, KPICard, StatusBadge } from '@/components/banking';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColumnDef } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import {
  Shield,
  Search,
  Calendar,
  Filter,
  Activity,
  UserCheck,
  FileEdit,
  Clock,
  Eye,
  TrendingUp,
  Database,
  Users,
  ChevronDown,
  ChevronUp,
  Copy,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entityType: string;
  entityId: string;
  changesSummary: string;
  ip: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────

const mockAuditLogs: AuditLogEntry[] = [
  {
    id: 'LOG-001',
    timestamp: '2025-06-16 09:02:14',
    user: 'Ерманова Асель Т.',
    action: 'client.created',
    entityType: 'Клиент',
    entityId: 'CL-5201',
    changesSummary: 'Создан новый клиент: Кенжебаев Азамат С. Паспорт: IIN 950101350142. Телефон: +7 701 234 5678.',
    ip: '10.0.1.45',
  },
  {
    id: 'LOG-002',
    timestamp: '2025-06-16 09:15:33',
    user: 'Оспанов Данияр К.',
    action: 'account.updated',
    entityType: 'Счёт',
    entityId: 'ACC-8834',
    changesSummary: 'Изменён лимит на снятие: 500 000 ₸ → 1 500 000 ₸. Клиент: Сериков Данияр А.',
    ip: '10.0.1.22',
  },
  {
    id: 'LOG-003',
    timestamp: '2025-06-16 09:28:07',
    user: 'Каримова Гульшат М.',
    action: 'application.approved',
    entityType: 'Заявка',
    entityId: 'APP-4401',
    changesSummary: 'Одобрена заявка на кредит «Потребительский». Сумма: 2 500 000 ₸. Срок: 24 мес.',
    ip: '10.0.2.11',
  },
  {
    id: 'LOG-004',
    timestamp: '2025-06-16 09:45:51',
    user: 'Сарсенов Нурлан Ж.',
    action: 'limit.changed',
    entityType: 'Лимит',
    entityId: 'LIM-0021',
    changesSummary: 'Повышен кредитный лимит для карты Visa Platinum: CL-1089. 3 000 000 ₸ → 5 000 000 ₸.',
    ip: '10.0.3.8',
  },
  {
    id: 'LOG-005',
    timestamp: '2025-06-16 10:03:22',
    user: 'Нурланова Мадина А.',
    action: 'card.blocked',
    entityType: 'Карта',
    entityId: 'CARD-9912',
    changesSummary: 'Заблокирована карта Mastercard Gold по заявлению клиента: CL-3045. Причина: утеря.',
    ip: '10.0.1.67',
  },
  {
    id: 'LOG-006',
    timestamp: '2025-06-16 10:18:45',
    user: 'Ерманова Асель Т.',
    action: 'deposit.created',
    entityType: 'Депозит',
    entityId: 'DEP-1103',
    changesSummary: 'Оформлен вклад «Надёжный» 12 мес. Сумма: 8 000 000 ₸. Ставка: 12.5% годовых.',
    ip: '10.0.1.45',
  },
  {
    id: 'LOG-007',
    timestamp: '2025-06-16 10:32:19',
    user: 'Оспанов Данияр К.',
    action: 'transaction.reversed',
    entityType: 'Транзакция',
    entityId: 'TXN-78432',
    changesSummary: 'Возврат транзакции. Сумма: 450 000 ₸. Причина: ошибка реквизитов получателя.',
    ip: '10.0.1.22',
  },
  {
    id: 'LOG-008',
    timestamp: '2025-06-16 10:48:03',
    user: 'Каримова Гульшат М.',
    action: 'client.updated',
    entityType: 'Клиент',
    entityId: 'CL-2156',
    changesSummary: 'Обновлены контактные данные клиента Жумабаева Айдана К. Новый телефон: +7 702 987 6543.',
    ip: '10.0.2.11',
  },
  {
    id: 'LOG-009',
    timestamp: '2025-06-16 11:05:37',
    user: 'Бекзатов Арман Р.',
    action: 'user.login',
    entityType: 'Пользователь',
    entityId: 'USR-045',
    changesSummary: 'Вход в систему. Устройство: Chrome/Windows. IP: 10.0.4.12. Местоположение: Алматы.',
    ip: '10.0.4.12',
  },
  {
    id: 'LOG-010',
    timestamp: '2025-06-16 11:22:18',
    user: 'Сарсенов Нурлан Ж.',
    action: 'application.rejected',
    entityType: 'Заявка',
    entityId: 'APP-4398',
    changesSummary: 'Отклонена заявка на ипотеку. Клиент: Умарова Зулфия М. Причина: низкий скоринг (52 балла).',
    ip: '10.0.3.8',
  },
  {
    id: 'LOG-011',
    timestamp: '2025-06-16 11:38:44',
    user: 'Нурланова Мадина А.',
    action: 'card.issued',
    entityType: 'Карта',
    entityId: 'CARD-9918',
    changesSummary: 'Эмиссия карты Visa Infinite. Клиент: Исаева Гулнора Х. Доставка: курьер.',
    ip: '10.0.1.67',
  },
  {
    id: 'LOG-012',
    timestamp: '2025-06-16 12:01:09',
    user: 'Ерманова Асель Т.',
    action: 'premie.calculated',
    entityType: 'Премия',
    entityId: 'PRM-0625',
    changesSummary: 'Рассчитана премия за май 2025. Отдел: Розничный бизнес. Всего: 12 сотрудников. Сумма: 4 850 000 ₸.',
    ip: '10.0.1.45',
  },
  {
    id: 'LOG-013',
    timestamp: '2025-06-16 12:15:56',
    user: 'Оспанов Данияр К.',
    action: 'account.closed',
    entityType: 'Счёт',
    entityId: 'ACC-7721',
    changesSummary: 'Закрыт счёт клиента Назаров Тимур С. Причина: заявление клиента. Остаток: 0 ₸.',
    ip: '10.0.1.22',
  },
  {
    id: 'LOG-014',
    timestamp: '2025-06-16 13:02:31',
    user: 'Каримова Гульшат М.',
    action: 'kpi.updated',
    entityType: 'KPI',
    entityId: 'KPI-06-55',
    changesSummary: 'Обновлены KPI сотрудника Каримов Алишер Р. Выполнение: 87% → 92%.',
    ip: '10.0.2.11',
  },
  {
    id: 'LOG-015',
    timestamp: '2025-06-16 13:28:14',
    user: 'Бекзатов Арман Р.',
    action: 'report.generated',
    entityType: 'Отчёт',
    entityId: 'RPT-011',
    changesSummary: 'Сформирован отчёт «Транзакции за май 2025». Формат: PDF. Размер: 4.1 MB.',
    ip: '10.0.4.12',
  },
  {
    id: 'LOG-016',
    timestamp: '2025-06-16 13:45:08',
    user: 'Сарсенов Нурлан Ж.',
    action: 'limit.changed',
    entityType: 'Лимит',
    entityId: 'LIM-0022',
    changesSummary: 'Установлен ежедневный лимит на переводы для CL-1102: 1 000 000 ₸.',
    ip: '10.0.3.8',
  },
  {
    id: 'LOG-017',
    timestamp: '2025-06-16 14:02:42',
    user: 'Нурланова Мадина А.',
    action: 'application.approved',
    entityType: 'Заявка',
    entityId: 'APP-4405',
    changesSummary: 'Одобрена заявка на Visa Gold. Клиент: Поляков Андрей В. Годовой оборот: ожидание.',
    ip: '10.0.1.67',
  },
  {
    id: 'LOG-018',
    timestamp: '2025-06-16 14:18:55',
    user: 'Ерманова Асель Т.',
    action: 'transfer.executed',
    entityType: 'Перевод',
    entityId: 'TRF-33421',
    changesSummary: 'Межбанковский перевод. Отправитель: Мирзаев Бекзод Т. Получатель: Касымов Ерлан. Сумма: 750 000 ₸.',
    ip: '10.0.1.45',
  },
  {
    id: 'LOG-019',
    timestamp: '2025-06-16 14:35:23',
    user: 'Оспанов Данияр К.',
    action: 'user.password_changed',
    entityType: 'Пользователь',
    entityId: 'USR-045',
    changesSummary: 'Смена пароля пользователем Бекзатов Арман Р. Причина: плановая замена.',
    ip: '10.0.1.22',
  },
  {
    id: 'LOG-020',
    timestamp: '2025-06-16 14:52:11',
    user: 'Каримова Гульшат М.',
    action: 'deposit.closed',
    entityType: 'Депозит',
    entityId: 'DEP-1087',
    changesSummary: 'Закрыт вклад «Рост» 3 мес. Клиент: Ахметов Санжар Б. Выплата: 2 120 000 ₸ (включая %).',
    ip: '10.0.2.11',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────

function getActionBadgeConfig(action: string): { label: string; className: string } {
  const configs: Record<string, { label: string; className: string }> = {
    'client.created':       { label: 'Создание', className: 'bg-bank-success/10 text-bank-success border-bank-success/20' },
    'client.updated':       { label: 'Обновление', className: 'bg-bank-info/10 text-bank-info border-bank-info/20' },
    'account.updated':      { label: 'Обновление', className: 'bg-bank-info/10 text-bank-info border-bank-info/20' },
    'account.closed':       { label: 'Закрытие', className: 'bg-bank-coal/10 text-bank-coal border-bank-coal/20' },
    'application.approved': { label: 'Одобрено', className: 'bg-bank-success/10 text-bank-success border-bank-success/20' },
    'application.rejected': { label: 'Отклонено', className: 'bg-bank-red/10 text-bank-red border-bank-red/20' },
    'limit.changed':        { label: 'Лимит', className: 'bg-bank-warning/10 text-bank-warning border-bank-warning/20' },
    'card.blocked':         { label: 'Блокировка', className: 'bg-bank-red/10 text-bank-red border-bank-red/20' },
    'card.issued':          { label: 'Эмиссия', className: 'bg-bank-info/10 text-bank-info border-bank-info/20' },
    'deposit.created':      { label: 'Создание', className: 'bg-bank-success/10 text-bank-success border-bank-success/20' },
    'deposit.closed':       { label: 'Закрытие', className: 'bg-bank-coal/10 text-bank-coal border-bank-coal/20' },
    'transaction.reversed': { label: 'Возврат', className: 'bg-bank-warning/10 text-bank-warning border-bank-warning/20' },
    'user.login':           { label: 'Вход', className: 'bg-muted text-muted-foreground border-border/60' },
    'user.password_changed':{ label: 'Пароль', className: 'bg-bank-warning/10 text-bank-warning border-bank-warning/20' },
    'premie.calculated':    { label: 'Расчёт', className: 'bg-bank-info/10 text-bank-info border-bank-info/20' },
    'kpi.updated':          { label: 'KPI', className: 'bg-bank-warning/10 text-bank-warning border-bank-warning/20' },
    'report.generated':     { label: 'Отчёт', className: 'bg-bank-info/10 text-bank-info border-bank-info/20' },
    'transfer.executed':    { label: 'Перевод', className: 'bg-bank-success/10 text-bank-success border-bank-success/20' },
  };
  return configs[action] ?? { label: action, className: 'bg-muted text-muted-foreground border-border/60' };
}

function getEntityTypeColor(entityType: string): string {
  const map: Record<string, string> = {
    'Клиент': 'text-bank-success',
    'Счёт': 'text-bank-info',
    'Заявка': 'text-bank-red',
    'Лимит': 'text-bank-warning',
    'Карта': 'text-bank-info',
    'Депозит': 'text-bank-success',
    'Транзакция': 'text-bank-coal',
    'Пользователь': 'text-muted-foreground',
    'Премия': 'text-bank-red',
    'KPI': 'text-bank-warning',
    'Отчёт': 'text-bank-info',
    'Перевод': 'text-bank-success',
  };
  return map[entityType] ?? 'text-muted-foreground';
}

// ─── Column Definitions ──────────────────────────────────────────────

const columns: ColumnDef<AuditLogEntry>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">{row.getValue('id')}</span>
    ),
  },
  {
    accessorKey: 'timestamp',
    header: 'Время',
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <Clock className="size-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {row.getValue('timestamp')}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'user',
    header: 'Пользователь',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-bank-active text-[10px] font-bold text-bank-red">
          {(row.getValue('user') as string)
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')}
        </div>
        <span className="text-sm font-medium whitespace-nowrap">{row.getValue('user')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'action',
    header: 'Действие',
    cell: ({ row }) => {
      const action = row.getValue('action') as string;
      const config = getActionBadgeConfig(action);
      return (
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className={cn('w-fit text-xs font-medium border', config.className)}>
            {config.label}
          </Badge>
          <span className="text-[10px] text-muted-foreground font-mono">{action}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'entityType',
    header: 'Тип сущности',
    cell: ({ row }) => (
      <span className={cn('text-sm font-medium', getEntityTypeColor(row.getValue('entityType') as string))}>
        {row.getValue('entityType')}
      </span>
    ),
  },
  {
    accessorKey: 'entityId',
    header: 'ID сущности',
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">{row.getValue('entityId')}</span>
    ),
  },
  {
    accessorKey: 'changesSummary',
    header: 'Изменения',
    cell: ({ row }) => (
      <span className="text-xs leading-relaxed text-muted-foreground line-clamp-2 max-w-[300px]">
        {row.getValue('changesSummary')}
      </span>
    ),
  },
];

// ─── Main Page ────────────────────────────────────────────────────────

export default function DataJournalPage() {
  const [dateFrom, setDateFrom] = useState('2025-06-16');
  const [dateTo, setDateTo] = useState('2025-06-16');
  const [actionType, setActionType] = useState('all');
  const [entityType, setEntityType] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  const actionTypes = [
    'all',
    'client.created',
    'client.updated',
    'account.updated',
    'account.closed',
    'application.approved',
    'application.rejected',
    'limit.changed',
    'card.blocked',
    'card.issued',
    'deposit.created',
    'deposit.closed',
    'transaction.reversed',
    'user.login',
    'premie.calculated',
    'kpi.updated',
    'transfer.executed',
  ];

  const entityTypes = [
    'all',
    'Клиент',
    'Счёт',
    'Заявка',
    'Лимит',
    'Карта',
    'Депозит',
    'Транзакция',
    'Пользователь',
    'Премия',
    'KPI',
    'Отчёт',
    'Перевод',
  ];

  const filteredLogs = mockAuditLogs.filter((entry) => {
    // Date filter
    const entryDate = entry.timestamp.split(' ')[0];
    if (dateFrom && entryDate < dateFrom) return false;
    if (dateTo && entryDate > dateTo) return false;

    // Action type filter
    if (actionType !== 'all' && entry.action !== actionType) return false;

    // Entity type filter
    if (entityType !== 'all' && entry.entityType !== entityType) return false;

    // User search
    if (userSearch) {
      const search = userSearch.toLowerCase();
      if (!entry.user.toLowerCase().includes(search)) return false;
    }

    return true;
  });

  // Compute KPI data
  const todayEntries = mockAuditLogs.filter(
    (e) => e.timestamp.startsWith('2025-06-16')
  ).length;

  // Find most active user
  const userCounts = mockAuditLogs.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.user] = (acc[entry.user] || 0) + 1;
    return acc;
  }, {});
  const mostActiveUser =
    Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  // Find most common action
  const actionCounts = mockAuditLogs.reduce<Record<string, number>>((acc, entry) => {
    const label = getActionBadgeConfig(entry.action).label;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
  const commonAction =
    Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  return (
    <PageContainer
      title="Журнал данных"
      subtitle="История изменений и аудит данных"
    >
      {/* KPI Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <KPICard
          title="Записей сегодня"
          value={todayEntries}
          icon={Database}
          change="16 июня 2025"
          changeType="neutral"
        />
        <KPICard
          title="Самый активный"
          value={mostActiveUser.split(' ').slice(0, 2).join(' ')}
          icon={UserCheck}
          change={`${userCounts[Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''] ?? 0} действий`}
          changeType="positive"
        />
        <KPICard
          title="Частое действие"
          value={commonAction}
          icon={Activity}
          change={`${actionCounts[Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''] ?? 0} раз`}
          changeType="neutral"
        />
      </div>

      {/* Advanced Filter Bar */}
      <div className="mb-6 rounded-lg border border-border/60 bg-muted/30 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-bank-coal">
          <Filter className="size-4" />
          Фильтры
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Дата начала</label>
            <div className="relative">
              <Calendar className="text-muted-foreground absolute left-3 top-1/2 size-3.5 -translate-y-1/2" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Дата окончания</label>
            <div className="relative">
              <Calendar className="text-muted-foreground absolute left-3 top-1/2 size-3.5 -translate-y-1/2" />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Действие</label>
            <Select value={actionType} onValueChange={setActionType}>
              <SelectTrigger className="h-9">
                <Activity className="mr-2 size-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {actionTypes.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a === 'all' ? 'Все действия' : `${getActionBadgeConfig(a).label} (${a})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Тип сущности</label>
            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger className="h-9">
                <Database className="mr-2 size-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {entityTypes.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e === 'all' ? 'Все типы' : e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Пользователь</label>
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-3.5 -translate-y-1/2" />
              <Input
                placeholder="Поиск по ФИО..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="h-9 pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-bank-coal" />
          <span className="text-sm font-semibold text-bank-coal">Аудит-лог</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {filteredLogs.length} из {mockAuditLogs.length} записей
        </p>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredLogs}
        searchKey="user"
        searchPlaceholder="Поиск по пользователю..."
        pageSize={10}
      />
    </PageContainer>
  );
}
