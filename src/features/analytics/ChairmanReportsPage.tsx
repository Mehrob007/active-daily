'use client';

import React, { useState, useMemo } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { KPICard } from '@/components/banking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  DollarSign, TrendingUp, Users, AlertTriangle, Download, Calendar,
  ArrowUpRight, ArrowDownRight, Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────

type Period = 'day' | 'week' | 'month' | 'quarter' | 'year';

interface ComparisonRow {
  metric: string;
  current: string;
  previous: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

// ─── Period selector config ────────────────────────────────────

const periods: { key: Period; label: string }[] = [
  { key: 'day', label: 'День' },
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
  { key: 'quarter', label: 'Квартал' },
  { key: 'year', label: 'Год' },
];

// ─── Mock Data ─────────────────────────────────────────────────

const revenueExpenseData = [
  { month: 'Янв', revenue: 1850, expenses: 1420 },
  { month: 'Фев', revenue: 1920, expenses: 1380 },
  { month: 'Мар', revenue: 2100, expenses: 1450 },
  { month: 'Апр', revenue: 2280, expenses: 1520 },
  { month: 'Май', revenue: 2150, expenses: 1490 },
  { month: 'Июн', revenue: 2400, expenses: 1540 },
  { month: 'Июл', revenue: 2350, expenses: 1580 },
  { month: 'Авг', revenue: 2520, expenses: 1620 },
  { month: 'Сен', revenue: 2680, expenses: 1650 },
  { month: 'Окт', revenue: 2750, expenses: 1700 },
  { month: 'Ноя', revenue: 2900, expenses: 1720 },
  { month: 'Дек', revenue: 3100, expenses: 1800 },
];

const departmentData = [
  { department: 'Ритейл', revenue: 4200 },
  { department: 'Корп. банкир.', revenue: 3600 },
  { department: 'Инвестиции', revenue: 2800 },
  { department: 'МССБ', revenue: 2100 },
  { department: 'Казначейство', revenue: 1800 },
  { department: 'Цифровой', revenue: 1500 },
];

const productData = [
  { name: 'Кредиты', value: 35, color: '#C8102E' },
  { name: 'Карточные продукты', value: 25, color: '#1A1A1A' },
  { name: 'Депозиты', value: 20, color: '#F59E0B' },
  { name: 'Платежи и переводы', value: 12, color: '#0EA5E9' },
  { name: 'Страхование', value: 8, color: '#16A34A' },
];

const comparisonData: ComparisonRow[] = [
  { metric: 'Общий доход', current: '₸31,0 млрд', previous: '₸27,5 млрд', change: 12.7, trend: 'up' },
  { metric: 'Чистая прибыль', current: '₸5,8 млрд', previous: '₸5,1 млрд', change: 13.7, trend: 'up' },
  { metric: 'Рост клиентской базы', current: '+1 240', previous: '+980', change: 26.5, trend: 'up' },
  { metric: 'NPL Ratio', current: '3,2%', previous: '3,8%', change: -15.8, trend: 'up' },
  { metric: 'ROE', current: '18,4%', previous: '17,1%', change: 7.6, trend: 'up' },
  { metric: 'ROA', current: '2,1%', previous: '1,9%', change: 10.5, trend: 'up' },
  { metric: 'CIR (стоимость/доход)', current: '52,3%', previous: '54,1%', change: -3.3, trend: 'up' },
  { metric: 'Кредитный портфель', current: '₸85,2 млрд', previous: '₸82,7 млрд', change: 3.0, trend: 'up' },
  { metric: 'Депозитная база', current: '₸110,4 млрд', previous: '₸98,6 млрд', change: 12.0, trend: 'up' },
  { metric: 'Опер. расходы', current: '₸18,0 млрд', previous: '₸17,2 млрд', change: 4.7, trend: 'down' },
];

const barColors = ['#C8102E', '#1A1A1A', '#F59E0B', '#0EA5E9', '#16A34A', '#8B5CF6'];

// ─── Custom Tooltip ────────────────────────────────────────────

function ChartTooltip({
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
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((item, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: item.color }}>
          {item.name}: {item.value.toLocaleString('ru-RU')} млн ₸
        </p>
      ))}
    </div>
  );
}

function BarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string; payload: { department: string } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-white p-3 shadow-lg">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{payload[0].payload.department}</p>
      {payload.map((item, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: item.color }}>
          Доход: {item.value.toLocaleString('ru-RU')} млн ₸
        </p>
      ))}
    </div>
  );
}

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-white p-3 shadow-lg">
      <p className="mb-1 text-sm font-semibold" style={{ color: payload[0].payload.color }}>
        {payload[0].name}
      </p>
      <p className="text-sm text-foreground">{payload[0].value}%</p>
    </div>
  );
}

// ─── Trend Icon ────────────────────────────────────────────────

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'neutral' }) {
  if (trend === 'up') {
    return <ArrowUpRight className="size-4 text-bank-success" />;
  }
  if (trend === 'down') {
    return <ArrowDownRight className="size-4 text-bank-red" />;
  }
  return <Minus className="size-4 text-muted-foreground" />;
}

// ─── Chairman Reports Page ─────────────────────────────────────

export default function ChairmanReportsPage() {
  const [activePeriod, setActivePeriod] = useState<Period>('year');

  const totalRevenue = useMemo(
    () => revenueExpenseData.reduce((sum, d) => sum + d.revenue, 0),
    [],
  );
  const totalExpenses = useMemo(
    () => revenueExpenseData.reduce((sum, d) => sum + d.expenses, 0),
    [],
  );
  const netProfit = totalRevenue - totalExpenses;

  return (
    <PageContainer
      title="Отчёты председателя"
      subtitle="Стратегическая аналитика и ключевые показатели банка"
      actions={
        <Button
          className="gap-2 bg-bank-coal hover:bg-bank-coal/90"
          size="sm"
        >
          <Download className="size-4" />
          Экспорт отчёта
        </Button>
      }
    >
      {/* ── Period Selector ─────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Calendar className="size-4 text-muted-foreground mr-1" />
        {periods.map((p) => (
          <Button
            key={p.key}
            variant={activePeriod === p.key ? 'default' : 'outline'}
            size="sm"
            className={cn(
              activePeriod === p.key
                ? 'bg-bank-red hover:bg-bank-red/90 text-white'
                : 'border-border/60 text-muted-foreground hover:text-foreground',
            )}
            onClick={() => setActivePeriod(p.key)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* ── KPI Cards ───────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Общий доход"
          value={`₸${totalRevenue.toLocaleString('ru-RU')}M`}
          change="+12,7%"
          changeType="positive"
          icon={DollarSign}
        />
        <KPICard
          title="Чистая прибыль"
          value={`₸${netProfit.toLocaleString('ru-RU')}M`}
          change="+18,4%"
          changeType="positive"
          icon={TrendingUp}
        />
        <KPICard
          title="Рост клиентской базы"
          value="+1 240"
          change="+26,5%"
          changeType="positive"
          icon={Users}
        />
        <KPICard
          title="NPL Ratio"
          value="3,2%"
          change="−0,6 п.п."
          changeType="positive"
          icon={AlertTriangle}
        />
      </div>

      {/* ── Revenue vs Expenses Line Chart ──────────────────── */}
      <Card className="mb-6 border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">
                Доходы и расходы
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Помесячная динамика за 12 месяцев (млн ₸)
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={revenueExpenseData}
              margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#6C757D' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6C757D' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                iconType="circle"
                iconSize={8}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Доходы"
                stroke="#C8102E"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#C8102E', strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name="Расходы"
                stroke="#1A1A1A"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#1A1A1A', strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Bar + Pie charts side by side ────────────────────── */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Bar Chart — Revenue by Department */}
        <Card className="border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Доходы по подразделениям
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Структура доходов по направлениям (млн ₸)
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={departmentData}
                margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal vertical={false} />
                <XAxis
                  dataKey="department"
                  tick={{ fontSize: 11, fill: '#6C757D' }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6C757D' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="revenue" name="Доход" radius={[6, 6, 0, 0]} barSize={40}>
                  {departmentData.map((_, i) => (
                    <Cell key={i} fill={barColors[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart — Product Portfolio */}
        <Card className="border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Портфель продуктов
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Распределение по категориям (%)
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="55%" height={260}>
                <PieChart>
                  <Pie
                    data={productData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {productData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2.5">
                {productData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-sm shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {item.name}
                    </span>
                    <span className="text-xs font-semibold text-foreground ml-auto">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Comparison Table ─────────────────────────────────── */}
      <Card className="border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Сравнение с предыдущим периодом
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Ключевые метрики — текущий период vs предыдущий
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/60">
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Метрика
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground text-right">
                    Текущий период
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground text-right">
                    Пред. период
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground text-right">
                    Изменение
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonData.map((row) => (
                  <TableRow key={row.metric} className="border-border/40">
                    <TableCell className="font-medium text-sm text-foreground">
                      {row.metric}
                    </TableCell>
                    <TableCell className="text-sm text-right font-semibold">
                      {row.current}
                    </TableCell>
                    <TableCell className="text-sm text-right text-muted-foreground">
                      {row.previous}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <TrendIcon trend={row.trend} />
                        <Badge
                          variant="outline"
                          className={cn(
                            'font-semibold text-xs',
                            row.trend === 'up' &&
                              'bg-bank-success/10 text-bank-success border-bank-success/20',
                            row.trend === 'down' &&
                              'bg-bank-red/10 text-bank-red border-bank-red/20',
                            row.trend === 'neutral' &&
                              'bg-muted text-muted-foreground border-border/60',
                          )}
                        >
                          {row.change > 0 ? '+' : ''}
                          {row.change.toFixed(1)}%
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
