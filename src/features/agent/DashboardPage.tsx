'use client';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { KPICard, StatusBadge } from '@/components/banking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  CreditCard, LayoutDashboard, Banknote, Users, TrendingUp, Activity,
  CheckCircle, XCircle, Clock, FileText,
} from 'lucide-react';
import React from 'react';

// ─── Mock Data ──────────────────────────────────────────────────

const monthlyData = [
  { month: 'Янв', заявки: 156, одобрено: 120 },
  { month: 'Фев', заявки: 189, одобрено: 145 },
  { month: 'Мар', заявки: 234, одобрено: 178 },
  { month: 'Апр', заявки: 278, одобрено: 215 },
  { month: 'Май', заявки: 312, одобрено: 247 },
];

const productData = [
  { name: 'Карты', value: 420, color: '#C8102E' },
  { name: 'Кредиты', value: 285, color: '#1A1A1A' },
  { name: 'Депозиты', value: 165, color: '#F59E0B' },
  { name: 'QR/Счета', value: 98, color: '#0EA5E9' },
  { name: 'Прочие', value: 52, color: '#16A34A' },
];

const recentActivity = [
  { action: 'Заявка на карту одобрена', client: 'Каримов Алишер Р.', time: '2 мин назад', icon: CheckCircle, iconColor: 'text-bank-success' },
  { action: 'Кредитная заявка подана', client: 'Рахимова Дилноза У.', time: '15 мин назад', icon: FileText, iconColor: 'text-bank-info' },
  { action: 'Депозит открыт — 12 мес.', client: 'Мирзаев Бекзод Т.', time: '42 мин назад', icon: TrendingUp, iconColor: 'text-bank-warning' },
  { action: 'Карта Visa Gold выдана', client: 'Сидорова Нодира А.', time: '1 ч назад', icon: CreditCard, iconColor: 'text-bank-red' },
  { action: 'Кредит одобрен — 5 000 000 ₸', client: 'Турсунов Жасур К.', time: '2 ч назад', icon: CheckCircle, iconColor: 'text-bank-success' },
  { action: 'Заявка на карту отклонена', client: 'Умарова Зулфия М.', time: '3 ч назад', icon: XCircle, iconColor: 'text-bank-red' },
  { action: 'Перевод выполнен', client: 'Ахметов Санжар Б.', time: '4 ч назад', icon: Activity, iconColor: 'text-bank-info' },
  { action: 'Депозит закрыт', client: 'Исаева Гулнора Х.', time: '5 ч назад', icon: Clock, iconColor: 'text-muted-foreground' },
];

const statusStats = [
  { label: 'На рассмотрении', value: 23, className: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: 'Одобрено', value: 47, className: 'bg-green-50 text-green-700 border-green-200' },
  { label: 'Отклонено', value: 5, className: 'bg-red-50 text-red-700 border-red-200' },
  { label: 'В работе', value: 112, className: 'bg-blue-50 text-blue-700 border-blue-200' },
];

// ─── Custom Tooltip ─────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-white p-3 shadow-lg">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((item, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: item.color }}>
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

// ─── Dashboard Page ─────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <PageContainer
      title="Панель управления"
      subtitle="Обзор ключевых показателей и активности"
      actions={
        <button className="inline-flex items-center gap-2 rounded-lg bg-bank-red px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-bank-red-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bank-red/40">
          <CreditCard className="h-4 w-4" />
          Новая заявка
        </button>
      }
    >
      {/* ── KPI Grid ─────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Всего заявок"
          value="1 284"
          change="+12,5%"
          changeType="positive"
          icon={LayoutDashboard}
        />
        <KPICard
          title="Карты выданы"
          value="847"
          change="+8,2%"
          changeType="positive"
          icon={CreditCard}
        />
        <KPICard
          title="Кредитный портфель"
          value="₸24,5M"
          change="−3,1%"
          changeType="negative"
          icon={Banknote}
        />
        <KPICard
          title="Активные клиенты"
          value="3 421"
          change="+5,7%"
          changeType="positive"
          icon={Users}
        />
      </div>

      {/* ── Activity + Status Stats ──────────────────────────── */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-bank-red" />
              <CardTitle className="text-sm font-semibold">Последняя активность</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="max-h-[380px] overflow-y-auto space-y-0">
              {recentActivity.map((item, i) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={i}
                    className="flex items-start justify-between border-b border-border/40 py-3 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted/60">
                        <ItemIcon className={`h-3.5 w-3.5 ${item.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.action}</p>
                        <p className="text-xs text-muted-foreground">{item.client}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Status Stats */}
        <Card className="border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-bank-red" />
              <CardTitle className="text-sm font-semibold">Статистика заявок</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {statusStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <Badge variant="outline" className={`font-semibold border ${stat.className}`}>
                    {stat.value}
                  </Badge>
                </div>
              ))}

              {/* Mini monthly summary */}
              <div className="mt-4 rounded-lg bg-muted/40 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Выполнение плана (май)
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-bank-red">87%</p>
                    <p className="text-[11px] text-muted-foreground">Карты</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-bank-red">92%</p>
                    <p className="text-[11px] text-muted-foreground">Кредиты</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-bank-red">78%</p>
                    <p className="text-[11px] text-muted-foreground">Депозиты</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Line Chart — Dynamics */}
        <Card className="border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Динамика заявок</CardTitle>
            <p className="text-xs text-muted-foreground">Количество поданных и одобренных заявок по месяцам</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6C757D' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6C757D' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="заявки"
                  stroke="#C8102E"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#C8102E' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="одобрено"
                  stroke="#16A34A"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#16A34A' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart — Product Structure */}
        <Card className="border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Структура продуктов</CardTitle>
            <p className="text-xs text-muted-foreground">Распределение заявок по типам продуктов</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="55%" height={260}>
                <PieChart>
                  <Pie
                    data={productData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {productData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value} шт.`, name]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                      fontSize: '13px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2.5">
                {productData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{item.name}</span>
                    <span className="text-xs font-semibold text-foreground ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
