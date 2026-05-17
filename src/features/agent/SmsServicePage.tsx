'use client';

import React, { useState, useMemo } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { DataTable, KPICard, StatusBadge } from '@/components/banking';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColumnDef } from '@tanstack/react-table';
import {
  Send,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Search,
  Filter,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────

type SmsStatus = 'sent' | 'failed' | 'pending' | 'scheduled';

interface SmsTemplate {
  id: string;
  name: string;
  content: string;
}

interface SmsHistoryItem {
  id: string;
  template: string;
  recipientsCount: number;
  status: SmsStatus;
  sentAt: string;
}

// ─── Mock Data ────────────────────────────────────────────────

const smsTemplates: SmsTemplate[] = [
  { id: 'tpl-1', name: 'Уведомление об одобрении', content: 'Уважаемый(ая) {name}, ваша заявка #{app_id} одобрена. Обратитесь в отделение для подписания документов.' },
  { id: 'tpl-2', name: 'Напоминание о платеже', content: 'Уважаемый(ая) {name}, напоминаем о необходимости внесения ежемесячного платежа по кредиту #{credit_id} до {date}. Сумма: {amount} ₸.' },
  { id: 'tpl-3', name: 'Блокировка карты', content: 'Уважаемый(ая) {name}, ваша карта ****{last4} заблокирована по вашей заявке. Для разблокировки обратитесь в службу поддержки.' },
  { id: 'tpl-4', name: 'Кэшбэк зачислен', content: 'Уважаемый(ая) {name}, на ваш счёт зачислен кэшбэк в размере {amount} ₸ за покупки в категории {category}.' },
  { id: 'tpl-5', name: 'Депозит закрыт', content: 'Уважаемый(ая) {name}, ваш вклад #{dep_id} закрыт. Сумма с процентами: {amount} ₸ зачислена на текущий счёт.' },
  { id: 'tpl-6', name: 'Новый продукт', content: 'Уважаемый(ая) {name}, для вас доступно специальное предложение! Кредит под {rate}% годовых. Подробнее: {link}' },
];

const mockSmsHistory: SmsHistoryItem[] = [
  { id: 'SMS-001', template: 'Уведомление об одобрении', recipientsCount: 245, status: 'sent', sentAt: '2025-05-15 14:30' },
  { id: 'SMS-002', template: 'Напоминание о платеже', recipientsCount: 1200, status: 'sent', sentAt: '2025-05-15 10:00' },
  { id: 'SMS-003', template: 'Кэшбэк зачислен', recipientsCount: 890, status: 'sent', sentAt: '2025-05-14 18:00' },
  { id: 'SMS-004', template: 'Новый продукт', recipientsCount: 5000, status: 'sent', sentAt: '2025-05-14 12:00' },
  { id: 'SMS-005', template: 'Блокировка карты', recipientsCount: 15, status: 'sent', sentAt: '2025-05-14 09:30' },
  { id: 'SMS-006', template: 'Уведомление об одобрении', recipientsCount: 180, status: 'failed', sentAt: '2025-05-13 16:45' },
  { id: 'SMS-007', template: 'Напоминание о платеже', recipientsCount: 1200, status: 'scheduled', sentAt: '2025-05-16 10:00' },
  { id: 'SMS-008', template: 'Депозит закрыт', recipientsCount: 45, status: 'sent', sentAt: '2025-05-13 14:20' },
  { id: 'SMS-009', template: 'Кэшбэк зачислен', recipientsCount: 890, status: 'pending', sentAt: '2025-05-15 18:00' },
  { id: 'SMS-010', template: 'Новый продукт', recipientsCount: 3200, status: 'scheduled', sentAt: '2025-05-17 09:00' },
];

// ─── Column Definitions ───────────────────────────────────────

const columns: ColumnDef<SmsHistoryItem>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">{row.getValue('id')}</span>
    ),
  },
  {
    accessorKey: 'template',
    header: 'Шаблон',
    cell: ({ row }) => <span className="font-medium">{row.getValue('template')}</span>,
  },
  {
    accessorKey: 'recipientsCount',
    header: 'Получатели',
    cell: ({ row }) => {
      const count = row.getValue('recipientsCount') as number;
      return <span className="tabular-nums">{count.toLocaleString('ru-RU')}</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
  },
  {
    accessorKey: 'sentAt',
    header: 'Дата отправки',
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">{row.getValue('sentAt')}</span>
    ),
  },
];

// ─── Page Component ───────────────────────────────────────────

export default function SmsServicePage() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [recipientGroup, setRecipientGroup] = useState<string>('all');
  const [bulkTemplateId, setBulkTemplateId] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const selectedTemplate = smsTemplates.find((t) => t.id === selectedTemplateId);

  const filteredHistory = useMemo(() => {
    if (statusFilter === 'all') return mockSmsHistory;
    return mockSmsHistory.filter((h) => h.status === statusFilter);
  }, [statusFilter]);

  // Stats
  const totalSent = mockSmsHistory
    .filter((h) => h.status === 'sent')
    .reduce((s, h) => s + h.recipientsCount, 0);
  const delivered = Math.round(totalSent * 0.94);
  const failedCount = mockSmsHistory
    .filter((h) => h.status === 'failed')
    .reduce((s, h) => s + h.recipientsCount, 0);
  const failedRate = totalSent > 0 ? ((failedCount / (totalSent + failedCount)) * 100).toFixed(1) : '0.0';

  return (
    <PageContainer
      title="SMS-сервис"
      subtitle="Управление SMS-уведомлениями и рассылками"
      actions={
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-bank-red px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-bank-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bank-red/40"
          onClick={() => alert('Отправка SMS — в разработке')}
        >
          <Send className="h-4 w-4" />
          Отправить SMS
        </button>
      }
    >
      {/* ── Stats Cards ──────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Всего отправлено"
          value={totalSent.toLocaleString('ru-RU')}
          change="+5,4%"
          changeType="positive"
          icon={Send}
        />
        <KPICard
          title="Доставлено"
          value={delivered.toLocaleString('ru-RU')}
          change="94,2%"
          changeType="positive"
          icon={CheckCircle}
        />
        <KPICard
          title="Доля ошибок"
          value={`${failedRate}%`}
          change="−0,8%"
          changeType="positive"
          icon={XCircle}
        />
        <KPICard
          title="Шаблоны"
          value={smsTemplates.length}
          change="+1"
          changeType="neutral"
          icon={FileText}
        />
      </div>

      {/* ── Template Preview Section ─────────────────────── */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Template selector */}
        <Card className="border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-bank-red" />
              <CardTitle className="text-sm font-semibold">Просмотр шаблона</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Выберите шаблон</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Выберите шаблон..." />
                </SelectTrigger>
                <SelectContent>
                  {smsTemplates.map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Предпросмотр</Label>
              <Textarea
                readOnly
                value={selectedTemplate?.content ?? 'Выберите шаблон для предпросмотра...'}
                className="min-h-[100px] resize-none bg-muted/40 text-sm"
                placeholder="Шаблон будет отображаться здесь"
              />
            </div>
          </CardContent>
        </Card>

        {/* Bulk SMS form */}
        <Card className="border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-bank-red" />
              <CardTitle className="text-sm font-semibold">Массовая рассылка</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm">Получатели</Label>
                <Select value={recipientGroup} onValueChange={setRecipientGroup}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все клиенты</SelectItem>
                    <SelectItem value="active_cards">Владельцы карт</SelectItem>
                    <SelectItem value="active_credits">Кредитные клиенты</SelectItem>
                    <SelectItem value="depositors">Вкладчики</SelectItem>
                    <SelectItem value="new_clients">Новые клиенты (30 дн.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Шаблон</Label>
                <Select value={bulkTemplateId} onValueChange={setBulkTemplateId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Выберите..." />
                  </SelectTrigger>
                  <SelectContent>
                    {smsTemplates.map((tpl) => (
                      <SelectItem key={tpl.id} value={tpl.id}>
                        {tpl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Или введите текст вручную</Label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[80px] resize-none text-sm"
                placeholder="Введите текст SMS-сообщения..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Запланировать отправку</Label>
              <Input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── History Filter ───────────────────────────────── */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-full sm:w-[200px]">
            <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="sent">Отправлено</SelectItem>
            <SelectItem value="failed">Ошибка</SelectItem>
            <SelectItem value="pending">В ожидании</SelectItem>
            <SelectItem value="scheduled">Запланировано</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по шаблону..."
            className="h-9 w-full pl-8 sm:w-[220px]"
          />
        </div>
      </div>

      {/* ── History Table ────────────────────────────────── */}
      <DataTable
        columns={columns}
        data={filteredHistory}
        searchKey="template"
        searchPlaceholder="Поиск по шаблону..."
        pageSize={10}
      />
    </PageContainer>
  );
}
