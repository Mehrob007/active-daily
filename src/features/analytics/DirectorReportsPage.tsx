'use client';

import React, { useState, useMemo } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { KPICard } from '@/components/banking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import {
  ClipboardList, CheckCircle, Clock, Trophy, Download,
  Building2, Users, FileCheck, Zap,
  Medal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Employee {
  rank: number;
  name: string;
  department: string;
  applications: number;
  approvals: number;
  revenue: string;
  score: number;
}

interface DepartmentMetric {
  name: string;
  applications: number;
  conversion: number;
  avgTime: string;
  satisfaction: number;
  trend: 'up' | 'down' | 'neutral';
}

const departments = [
  'Все подразделения',
  'Ритейл-банкинг',
  'Корпоративный отдел',
  'Кредитный департамент',
  'Отдел депозитов',
  'Платежные системы',
  'Цифровые продукты',
];

const teamPerformanceData = [
  { name: 'Каримов А.Р.', applications: 87, score: 94 },
  { name: 'Рахимова Д.У.', applications: 82, score: 91 },
  { name: 'Мирзаев Б.Т.', applications: 78, score: 88 },
  { name: 'Турсунов Ж.К.', applications: 75, score: 86 },
  { name: 'Сидорова Н.А.', applications: 71, score: 83 },
  { name: 'Ахметов С.Б.', applications: 68, score: 80 },
  { name: 'Исаева Г.Х.', applications: 62, score: 77 },
  { name: 'Умарова З.М.', applications: 58, score: 74 },
];

const applicationFlowData = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const base = 35 + Math.sin(i * 0.4) * 15;
  return {
    day: `${day}`,
    submitted: Math.round(base + Math.random() * 10),
    approved: Math.round(base * 0.72 + Math.random() * 5),
    rejected: Math.round(base * 0.12 + Math.random() * 3),
  };
});

const topPerformers: Employee[] = [
  { rank: 1, name: 'Каримов Алишер Р.', department: 'Ритейл-банкинг', applications: 87, approvals: 74, revenue: '₸42,5M', score: 94 },
  { rank: 2, name: 'Рахимова Дилноза У.', department: 'Кредитный департамент', applications: 82, approvals: 68, revenue: '₸38,2M', score: 91 },
  { rank: 3, name: 'Мирзаев Бекзод Т.', department: 'Ритейл-банкинг', applications: 78, approvals: 65, revenue: '₸35,8M', score: 88 },
  { rank: 4, name: 'Турсунов Жасур К.', department: 'Цифровые продукты', applications: 75, approvals: 62, revenue: '₸31,4M', score: 86 },
  { rank: 5, name: 'Сидорова Нодира А.', department: 'Корпоративный отдел', applications: 71, approvals: 60, revenue: '₸29,7M', score: 83 },
  { rank: 6, name: 'Ахметов Санжар Б.', department: 'Отдел депозитов', applications: 68, approvals: 57, revenue: '₸27,1M', score: 80 },
  { rank: 7, name: 'Исаева Гулнора Х.', department: 'Платежные системы', applications: 62, approvals: 51, revenue: '₸23,8M', score: 77 },
  { rank: 8, name: 'Умарова Зулфия М.', department: 'Кредитный департамент', applications: 58, approvals: 47, revenue: '₸21,3M', score: 74 },
];

const departmentMetrics: DepartmentMetric[] = [
  { name: 'Ритейл-банкинг', applications: 342, conversion: 84.2, avgTime: '1 ч 12 мин', satisfaction: 92, trend: 'up' },
  { name: 'Корпоративный отдел', applications: 128, conversion: 78.5, avgTime: '2 ч 35 мин', satisfaction: 88, trend: 'up' },
  { name: 'Кредитный департамент', applications: 256, conversion: 72.1, avgTime: '3 ч 18 мин', satisfaction: 85, trend: 'neutral' },
  { name: 'Отдел депозитов', applications: 98, conversion: 90.3, avgTime: '45 мин', satisfaction: 94, trend: 'up' },
  { name: 'Платежные системы', applications: 187, conversion: 81.6, avgTime: '1 ч 50 мин', satisfaction: 89, trend: 'down' },
  { name: 'Цифровые продукты', applications: 215, conversion: 87.9, avgTime: '58 мин', satisfaction: 91, trend: 'up' },
];

function BarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string; payload: { name: string } }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-white p-3 shadow-lg">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">
        {payload[0].payload.name}
      </p>
      {payload.map((item, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: item.color }}>
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

function AreaTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-white p-3 shadow-lg">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">День {label}</p>
      {payload.map((item, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: item.color }}>
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-100">
        <Medal className="size-4 text-yellow-600" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
        <Medal className="size-4 text-gray-500" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-50">
        <Medal className="size-4 text-orange-500" />
      </div>
    );
  }
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
      {rank}
    </div>
  );
}

export default function DirectorReportsPage() {
  const [selectedDepartment, setSelectedDepartment] = useState('Все подразделения');

  const totalApps = applicationFlowData.reduce((s, d) => s + d.submitted, 0);
  const totalApproved = applicationFlowData.reduce((s, d) => s + d.approved, 0);
  const conversionRate = ((totalApproved / totalApps) * 100).toFixed(1);

  const avgProcessingTime = useMemo(() => {
    const times = [72, 85, 95, 68, 78, 92, 65, 88, 74, 81];
    const avg = times.reduce((s, t) => s + t, 0) / times.length;
    const hours = Math.floor(avg / 60);
    const mins = Math.round(avg % 60);
    return `${hours} ч ${mins} мин`;
  }, []);

  return (
    <PageContainer
      title="Отчёты директора"
      subtitle="Операционные отчёты и KPI по подразделениям"
      actions={
        <button className="inline-flex items-center gap-2 rounded-lg bg-bank-coal px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-bank-coal/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bank-coal/40">
          <Download className="h-4 w-4" />
          Экспорт
        </button>
      }
    >
      {}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Building2 className="size-4 text-muted-foreground" />
        <Select
          value={selectedDepartment}
          onValueChange={setSelectedDepartment}
        >
          <SelectTrigger className="w-[260px]">
            <SelectValue placeholder="Подразделение" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Заявки сегодня"
          value={String(applicationFlowData[applicationFlowData.length - 1].submitted)}
          change="+14,2%"
          changeType="positive"
          icon={ClipboardList}
        />
        <KPICard
          title="Конверсия"
          value={`${conversionRate}%`}
          change="+3,8 п.п."
          changeType="positive"
          icon={CheckCircle}
        />
        <KPICard
          title="Ср. время обработки"
          value={avgProcessingTime}
          change="−12 мин"
          changeType="positive"
          icon={Clock}
        />
        <KPICard
          title="Оценка команды"
          value="84,2"
          change="+2,1"
          changeType="positive"
          icon={Trophy}
        />
      </div>

      {}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {}
        <Card className="border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Результативность команды
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Количество заявок и рейтинг по сотрудникам
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={teamPerformanceData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: '#6C757D' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#6C757D' }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip content={<BarTooltip />} />
                <Bar
                  dataKey="applications"
                  name="Заявки"
                  fill="#C8102E"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="score"
                  name="Рейтинг"
                  fill="#0EA5E9"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {}
        <Card className="border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Поток заявок за 30 дней
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Поданные, одобренные и отклонённые заявки
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={applicationFlowData}
                margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8102E" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#C8102E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#6C757D' }}
                  axisLine={false}
                  tickLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6C757D' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<AreaTooltip />} />
                <Area
                  type="monotone"
                  dataKey="submitted"
                  name="Подано"
                  stroke="#C8102E"
                  strokeWidth={2}
                  fill="url(#colorSubmitted)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="approved"
                  name="Одобрено"
                  stroke="#16A34A"
                  strokeWidth={2}
                  fill="url(#colorApproved)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="rejected"
                  name="Отклонено"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fill="url(#colorRejected)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {}
      <Card className="mb-6 border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-bank-red" />
            <CardTitle className="text-sm font-semibold">
              Лучшие сотрудники
            </CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Рейтинг по результативности за текущий месяц
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/60">
                  <TableHead className="w-16 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    #
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Сотрудник
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Подразделение
                  </TableHead>
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Заявки
                  </TableHead>
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Одобрено
                  </TableHead>
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Доход
                  </TableHead>
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Рейтинг
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPerformers.map((emp) => (
                  <TableRow key={emp.rank} className="border-border/40">
                    <TableCell>
                      <RankBadge rank={emp.rank} />
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {emp.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {emp.department}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      {emp.applications}
                    </TableCell>
                    <TableCell className="text-right text-sm text-bank-success font-medium">
                      {emp.approvals}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      {emp.revenue}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          'font-semibold text-xs',
                          emp.score >= 90 &&
                            'bg-bank-success/10 text-bank-success border-bank-success/20',
                          emp.score >= 80 &&
                            emp.score < 90 &&
                            'bg-bank-info/10 text-bank-info border-bank-info/20',
                          emp.score < 80 &&
                            'bg-bank-warning/10 text-bank-warning border-bank-warning/20',
                        )}
                      >
                        {emp.score}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {}
      <Card className="border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-bank-red" />
            <CardTitle className="text-sm font-semibold">
              Метрики по подразделениям
            </CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Ключевые показатели каждого подразделения
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {departmentMetrics.map((dept) => (
              <div
                key={dept.name}
                className="rounded-lg border border-border/60 p-4 transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-bank-active">
                      <Users className="size-4 text-bank-red" />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {dept.name}
                    </h4>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[11px] font-medium',
                      dept.trend === 'up' &&
                        'bg-bank-success/10 text-bank-success border-bank-success/20',
                      dept.trend === 'down' &&
                        'bg-bank-red/10 text-bank-red border-bank-red/20',
                      dept.trend === 'neutral' &&
                        'bg-muted text-muted-foreground border-border/60',
                    )}
                  >
                    {dept.trend === 'up' ? '↑ Рост' : dept.trend === 'down' ? '↓ Снижение' : '→ Стабильно'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      Заявки
                    </p>
                    <p className="text-base font-bold text-foreground">
                      {dept.applications}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      Конверсия
                    </p>
                    <p className="text-base font-bold text-foreground">
                      {dept.conversion}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      Ср. время
                    </p>
                    <p className="text-base font-bold text-foreground">
                      {dept.avgTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      Удовл.
                    </p>
                    <p className="text-base font-bold text-bank-success">
                      {dept.satisfaction}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
