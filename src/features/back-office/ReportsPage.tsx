'use client';

import React, { useState, useMemo } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { DataTable, KPICard, StatusBadge } from '@/components/banking';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ColumnDef } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import {
  FileText,
  FileSpreadsheet,
  FileDown,
  Calendar,
  Download,
  Filter,
  BarChart3,
  FileClock,
  Zap,
  Building2,
  Users,
  TrendingUp,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────

interface ReportRecord {
  id: string;
  reportType: string;
  period: string;
  format: 'PDF' | 'Excel' | 'CSV';
  generatedAt: string;
  status: 'ready' | 'error' | 'processing';
  fileSize: string;
  generatedBy: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────

const mockReports: ReportRecord[] = [
  { id: 'RPT-001', reportType: 'Премии', period: '2025-05-01 — 2025-05-31', format: 'PDF', generatedAt: '2025-06-01 09:15', status: 'ready', fileSize: '1.2 MB', generatedBy: 'Ерманова Асель Т.' },
  { id: 'RPT-002', reportType: 'Заявки', period: '2025-05-01 — 2025-05-15', format: 'Excel', generatedAt: '2025-05-16 14:30', status: 'ready', fileSize: '845 KB', generatedBy: 'Оспанов Данияр К.' },
  { id: 'RPT-003', reportType: 'Транзакции', period: '2025-05-10 — 2025-05-20', format: 'CSV', generatedAt: '2025-05-21 10:45', status: 'ready', fileSize: '3.4 MB', generatedBy: 'Каримова Гульшат М.' },
  { id: 'RPT-004', reportType: 'KPI', period: '2025-Q1', format: 'PDF', generatedAt: '2025-04-02 08:00', status: 'ready', fileSize: '2.1 MB', generatedBy: 'Сарсенов Нурлан Ж.' },
  { id: 'RPT-005', reportType: 'Премии', period: '2025-04-01 — 2025-04-30', format: 'Excel', generatedAt: '2025-05-01 09:00', status: 'ready', fileSize: '1.8 MB', generatedBy: 'Ерманова Асель Т.' },
  { id: 'RPT-006', reportType: 'Заявки', period: '2025-04-15 — 2025-04-30', format: 'PDF', generatedAt: '2025-05-01 11:20', status: 'error', fileSize: '—', generatedBy: 'Оспанов Данияр К.' },
  { id: 'RPT-007', reportType: 'Транзакции', period: '2025-04-01 — 2025-04-30', format: 'Excel', generatedAt: '2025-05-02 16:00', status: 'ready', fileSize: '5.2 MB', generatedBy: 'Каримова Гульшат М.' },
  { id: 'RPT-008', reportType: 'KPI', period: '2025-04', format: 'PDF', generatedAt: '2025-05-05 09:30', status: 'ready', fileSize: '1.5 MB', generatedBy: 'Сарсенов Нурлан Ж.' },
  { id: 'RPT-009', reportType: 'Премии', period: '2025-03-01 — 2025-03-31', format: 'CSV', generatedAt: '2025-04-01 10:00', status: 'ready', fileSize: '920 KB', generatedBy: 'Ерманова Асель Т.' },
  { id: 'RPT-010', reportType: 'Заявки', period: '2025-06-01 — 2025-06-15', format: 'PDF', generatedAt: '2025-06-16 08:45', status: 'processing', fileSize: '—', generatedBy: 'Оспанов Данияр К.' },
];

const reportTypes = [
  { id: 'premii', label: 'Премии', icon: FileText, description: 'Отчёт по премиям и бонусам сотрудников', color: 'text-bank-red' },
  { id: 'zayavki', label: 'Заявки', icon: FileClock, description: 'Статистика по банковским заявкам', color: 'text-bank-info' },
  { id: 'transakcii', label: 'Транзакции', icon: TrendingUp, description: 'Аналитика по транзакциям и операциям', color: 'text-bank-success' },
  { id: 'kpi', label: 'KPI', icon: BarChart3, description: 'Ключевые показатели эффективности', color: 'text-bank-warning' },
];

const departments = [
  'Все отделы',
  'Розничный бизнес',
  'Корпоративный бизнес',
  'Кредитный отдел',
  'Карточный центр',
  'Комплаенс',
  'Бухгалтерия',
];

const employees = [
  'Все сотрудники',
  'Ерманова Асель Т.',
  'Оспанов Данияр К.',
  'Каримова Гульшат М.',
  'Сарсенов Нурлан Ж.',
  'Нурланова Мадина А.',
  'Бекзатов Арман Р.',
];

// ─── Column Definitions ──────────────────────────────────────────────

const columns: ColumnDef<ReportRecord>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">{row.getValue('id')}</span>
    ),
  },
  {
    accessorKey: 'reportType',
    header: 'Тип отчёта',
    cell: ({ row }) => {
      const type = row.getValue('reportType') as string;
      const colorMap: Record<string, string> = {
        'Премии': 'bg-bank-red/10 text-bank-red border-bank-red/20',
        'Заявки': 'bg-bank-info/10 text-bank-info border-bank-info/20',
        'Транзакции': 'bg-bank-success/10 text-bank-success border-bank-success/20',
        'KPI': 'bg-bank-warning/10 text-bank-warning border-bank-warning/20',
      };
      return (
        <Badge variant="outline" className={cn('text-xs font-medium border', colorMap[type] ?? '')}>
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'period',
    header: 'Период',
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.getValue('period')}</span>,
  },
  {
    accessorKey: 'format',
    header: 'Формат',
    cell: ({ row }) => {
      const format = row.getValue('format') as string;
      const formatConfig: Record<string, { icon: React.ElementType; color: string }> = {
        PDF: { icon: FileText, color: 'text-bank-red' },
        Excel: { icon: FileSpreadsheet, color: 'text-bank-success' },
        CSV: { icon: FileDown, color: 'text-bank-info' },
      };
      const config = formatConfig[format];
      const Icon = config?.icon ?? FileText;
      return (
        <div className="flex items-center gap-1.5">
          <Icon className={cn('size-4', config?.color)} />
          <span className="text-sm font-medium">{format}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'generatedAt',
    header: 'Создан',
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.getValue('generatedAt')}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return <StatusBadge status={status === 'ready' ? 'completed' : status} />;
    },
  },
  {
    accessorKey: 'fileSize',
    header: 'Размер',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.getValue('fileSize')}</span>
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          disabled={status !== 'ready'}
          title={status === 'ready' ? 'Скачать' : 'Недоступно'}
        >
          <Download className={cn('size-4', status === 'ready' ? 'text-bank-red' : 'text-muted-foreground/40')} />
        </Button>
      );
    },
  },
];

// ─── Report Type Selector ─────────────────────────────────────────────

function ReportTypeSelector({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {reportTypes.map((type) => {
        const Icon = type.icon;
        const isSelected = selected === type.id;
        return (
          <Card
            key={type.id}
            className={cn(
              'cursor-pointer border transition-all',
              isSelected
                ? 'border-bank-red bg-bank-active shadow-sm'
                : 'border-border/60 hover:border-bank-red/30'
            )}
            onClick={() => onSelect(type.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted', isSelected && 'bg-bank-red/10')}>
                  <Icon className={cn('size-5', type.color, isSelected && 'text-bank-red')} />
                </div>
                <div className="min-w-0">
                  <p className={cn('text-sm font-semibold', isSelected && 'text-bank-red')}>{type.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{type.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState('premii');
  const [dateFrom, setDateFrom] = useState('2025-05-01');
  const [dateTo, setDateTo] = useState('2025-05-31');
  const [department, setDepartment] = useState('Все отделы');
  const [employee, setEmployee] = useState('Все сотрудники');
  const [format, setFormat] = useState<'PDF' | 'Excel' | 'CSV'>('PDF');
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredReports = useMemo(() => {
    const typeMap: Record<string, string> = {
      premii: 'Премии',
      zayavki: 'Заявки',
      transakcii: 'Транзакции',
      kpi: 'KPI',
    };
    return mockReports.filter((r) => r.reportType === typeMap[selectedType]);
  }, [selectedType]);

  const readyCount = mockReports.filter((r) => r.status === 'ready').length;
  const thisMonthCount = mockReports.filter(
    (r) => r.generatedAt.startsWith('2025-06')
  ).length;

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <PageContainer
      title="Отчёты"
      subtitle="Формирование и просмотр отчётов"
      actions={
        <Button
          className="bg-bank-red text-white hover:bg-bank-red/90"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Zap className="mr-2 size-4 animate-pulse" />
              Генерация...
            </>
          ) : (
            <>
              <FileDown className="mr-2 size-4" />
              Сформировать отчёт
            </>
          )}
        </Button>
      }
    >
      {/* KPI cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <KPICard
          title="Всего отчётов"
          value={mockReports.length}
          icon={FileText}
          change={`${readyCount} готовы`}
          changeType="positive"
        />
        <KPICard
          title="За этот месяц"
          value={thisMonthCount}
          icon={Calendar}
          change="Июнь 2025"
          changeType="neutral"
        />
        <KPICard
          title="Среднее время генерации"
          value="4.2 с"
          icon={Zap}
          change="-12% быстрее"
          changeType="positive"
        />
      </div>

      {/* Report Type Selector */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-bank-coal">Тип отчёта</h3>
        <ReportTypeSelector selected={selectedType} onSelect={setSelectedType} />
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg border border-border/60 bg-muted/30 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-bank-coal">
          <Filter className="size-4" />
          Параметры отчёта
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Дата начала</Label>
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
            <Label className="text-xs text-muted-foreground">Дата окончания</Label>
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
            <Label className="text-xs text-muted-foreground">Отдел</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="h-9">
                <Building2 className="mr-2 size-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Сотрудник</Label>
            <Select value={employee} onValueChange={setEmployee}>
              <SelectTrigger className="h-9">
                <Users className="mr-2 size-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Format Selector */}
        <div className="mt-4">
          <Label className="mb-2 block text-xs text-muted-foreground">Формат</Label>
          <RadioGroup
            value={format}
            onValueChange={(v) => setFormat(v as 'PDF' | 'Excel' | 'CSV')}
            className="flex flex-wrap gap-3"
          >
            {(['PDF', 'Excel', 'CSV'] as const).map((f) => {
              const icons: Record<string, React.ElementType> = {
                PDF: FileText,
                Excel: FileSpreadsheet,
                CSV: FileDown,
              };
              const colors: Record<string, string> = {
                PDF: 'text-bank-red',
                Excel: 'text-bank-success',
                CSV: 'text-bank-info',
              };
              const Icon = icons[f];
              return (
                <Label
                  key={f}
                  htmlFor={`format-${f}`}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all',
                    format === f
                      ? 'border-bank-red bg-bank-active text-bank-red'
                      : 'border-border/60 text-muted-foreground hover:border-bank-red/30'
                  )}
                >
                  <RadioGroupItem value={f} id={`format-${f}`} className="sr-only" />
                  <Icon className={cn('size-4', colors[f])} />
                  {f}
                </Label>
              );
            })}
          </RadioGroup>
        </div>
      </div>

      {/* Report History Table */}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-bank-coal">
          История отчётов — {reportTypes.find((t) => t.id === selectedType)?.label}
        </h3>
        <p className="text-xs text-muted-foreground">
          {filteredReports.length} записей
        </p>
      </div>

      <DataTable
        columns={columns}
        data={filteredReports}
        searchKey="id"
        searchPlaceholder="Поиск по ID..."
        pageSize={10}
      />
    </PageContainer>
  );
}
