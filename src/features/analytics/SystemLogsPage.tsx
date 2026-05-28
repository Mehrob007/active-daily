'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { DataTable } from '@/components/banking';
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
import type { SystemLog } from '@/types';
import {
  Search,
  Filter,
  LogIn,
  Trash2,
  Pencil,
  Eye,
  Shield,
  Download,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mockLogs: SystemLog[] = [
  { id: 'LOG-001', userId: 'USR-001', userName: 'Каримов А.Р.', action: 'login', resource: 'auth', details: 'Вход в систему — успех', ip: '192.168.1.45', timestamp: '2025-05-15 14:32:05' },
  { id: 'LOG-002', userId: 'USR-002', userName: 'Рахимова Д.У.', action: 'create', resource: 'applications', details: 'Создана заявка APP-002', ip: '192.168.1.78', timestamp: '2025-05-15 14:28:11' },
  { id: 'LOG-003', userId: 'USR-003', userName: 'Мирзаев Б.Т.', action: 'update', resource: 'clients', details: 'Обновлены данные клиента CL-1056', ip: '192.168.2.12', timestamp: '2025-05-15 13:55:42' },
  { id: 'LOG-004', userId: 'USR-001', userName: 'Каримов А.Р.', action: 'delete', resource: 'drafts', details: 'Удалён черновик заявки DRF-009', ip: '192.168.1.45', timestamp: '2025-05-15 13:12:33' },
  { id: 'LOG-005', userId: 'USR-004', userName: 'Сидорова Н.А.', action: 'login', resource: 'auth', details: 'Вход в систему — успех', ip: '10.0.0.34', timestamp: '2025-05-15 12:00:00' },
  { id: 'LOG-006', userId: 'USR-005', userName: 'Турсунов Ж.К.', action: 'export', resource: 'reports', details: 'Экспорт отчёта за апрель 2025', ip: '192.168.3.56', timestamp: '2025-05-15 11:45:20' },
  { id: 'LOG-007', userId: 'USR-006', userName: 'Умарова З.М.', action: 'update', resource: 'products', details: 'Изменена ставка по продукту «Рост»', ip: '192.168.1.89', timestamp: '2025-05-15 11:20:55' },
  { id: 'LOG-008', userId: 'USR-002', userName: 'Рахимова Д.У.', action: 'view', resource: 'transactions', details: 'Просмотр транзакций TXN-001…TXN-010', ip: '192.168.1.78', timestamp: '2025-05-15 10:30:15' },
  { id: 'LOG-009', userId: 'USR-007', userName: 'Ахметов С.Б.', action: 'delete', resource: 'users', details: 'Удалён временный пользователь temp_usr_03', ip: '10.0.0.67', timestamp: '2025-05-15 09:15:40' },
  { id: 'LOG-010', userId: 'USR-003', userName: 'Мирзаев Б.Т.', action: 'login', resource: 'auth', details: 'Вход в систему — отказ (неверный пароль)', ip: '192.168.2.12', timestamp: '2025-05-15 09:05:02' },
  { id: 'LOG-011', userId: 'USR-008', userName: 'Исаева Г.Х.', action: 'create', resource: 'deposits', details: 'Открыт депозит DEP-088', ip: '192.168.4.21', timestamp: '2025-05-14 17:30:00' },
  { id: 'LOG-012', userId: 'USR-009', userName: 'Назаров Т.С.', action: 'update', resource: 'settings', details: 'Изменены личные настройки уведомлений', ip: '192.168.1.110', timestamp: '2025-05-14 16:22:33' },
  { id: 'LOG-013', userId: 'USR-010', userName: 'Касымова М.Ж.', action: 'export', resource: 'premies', details: 'Экспорт расчёта премий — май 2025', ip: '10.0.0.88', timestamp: '2025-05-14 15:10:12' },
  { id: 'LOG-014', userId: 'USR-001', userName: 'Каримов А.Р.', action: 'logout', resource: 'auth', details: 'Выход из системы', ip: '192.168.1.45', timestamp: '2025-05-14 18:00:00' },
  { id: 'LOG-015', userId: 'USR-005', userName: 'Турсунов Ж.К.', action: 'view', resource: 'logs', details: 'Просмотр системных логов', ip: '192.168.3.56', timestamp: '2025-05-14 14:45:30' },
];

const actionConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  login:   { label: 'Вход',    icon: LogIn,    className: 'bg-green-50 text-green-700 border-green-200' },
  logout:  { label: 'Выход',   icon: LogIn,    className: 'bg-gray-100 text-gray-600 border-gray-200' },
  create:  { label: 'Создание', icon: Eye,     className: 'bg-blue-50 text-blue-700 border-blue-200' },
  update:  { label: 'Обновление', icon: Pencil, className: 'bg-amber-50 text-amber-700 border-amber-200' },
  delete:  { label: 'Удаление',  icon: Trash2,  className: 'bg-red-50 text-red-700 border-red-200' },
  view:    { label: 'Просмотр',  icon: Eye,    className: 'bg-gray-100 text-gray-600 border-gray-200' },
  export:  { label: 'Экспорт',   icon: Download, className: 'bg-purple-50 text-purple-700 border-purple-200' },
};

function ActionBadge({ action }: { action: string }) {
  const cfg = actionConfig[action] ?? { label: action, icon: Settings, className: 'bg-gray-100 text-gray-600 border-gray-200' };
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={cn('inline-flex items-center gap-1 text-xs font-medium border', cfg.className)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}

const columns: ColumnDef<SystemLog>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Время',
    cell: ({ row }) => <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">{row.getValue('timestamp')}</span>,
  },
  { accessorKey: 'userName', header: 'Пользователь', cell: ({ row }) => <span className="font-medium">{row.getValue('userName')}</span> },
  { accessorKey: 'action', header: 'Действие', cell: ({ row }) => <ActionBadge action={row.getValue('action')} /> },
  {
    accessorKey: 'resource',
    header: 'Ресурс',
    cell: ({ row }) => <Badge variant="secondary" className="bg-muted text-xs">{row.getValue('resource')}</Badge>,
  },
  { accessorKey: 'details', header: 'Детали', cell: ({ row }) => <span className="max-w-[250px] truncate text-muted-foreground">{row.getValue('details')}</span> },
  { accessorKey: 'ip', header: 'IP', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('ip')}</span> },
];

export default function SystemLogsPage() {
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');

  const filteredData = mockLogs.filter((log) => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (userFilter !== 'all' && log.userName !== userFilter) return false;
    return true;
  });

  const uniqueUsers = Array.from(new Set(mockLogs.map((l) => l.userName)));

  return (
    <PageContainer title="Системные логи" subtitle="Журнал системных событий и действий пользователей">
      {}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Поиск по пользователю..." className="h-9 pl-8" />
        </div>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Пользователь" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все пользователи</SelectItem>
            {uniqueUsers.map((u) => (
              <SelectItem key={u} value={u}>{u}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Тип действия" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все действия</SelectItem>
            <SelectItem value="login">Вход / Выход</SelectItem>
            <SelectItem value="create">Создание</SelectItem>
            <SelectItem value="update">Обновление</SelectItem>
            <SelectItem value="delete">Удаление</SelectItem>
            <SelectItem value="view">Просмотр</SelectItem>
            <SelectItem value="export">Экспорт</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" className="h-9" />
      </div>

      {}
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(actionConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={cn('h-2.5 w-2.5 rounded-full', cfg.className.split(' ')[0])} />
            <span className="text-[11px] text-muted-foreground">{cfg.label}</span>
          </div>
        ))}
      </div>

      {}
      <DataTable
        columns={columns}
        data={filteredData}
        searchKey="details"
        searchPlaceholder="Поиск по деталям..."
        pageSize={10}
      />
    </PageContainer>
  );
}
