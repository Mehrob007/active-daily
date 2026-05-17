'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { DataTable, StatusBadge, KPICard } from '@/components/banking';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColumnDef } from '@tanstack/react-table';
import type { PremieRecord } from '@/types';
import {
  Calculator,
  Wallet,
  Users,
  TrendingUp,
} from 'lucide-react';

// ─── Mock Data ──────────────────────────────────────────────────

const mockPremies: PremieRecord[] = [
  { id: 'PRM-001', employeeId: 'EMP-101', employeeName: 'Каримов Алишер Р.', period: 'Май 2025', kpiScore: 92, bonusAmount: 450000, deductions: 25000, totalAmount: 425000, status: 'approved' },
  { id: 'PRM-002', employeeId: 'EMP-102', employeeName: 'Рахимова Дилноза У.', period: 'Май 2025', kpiScore: 88, bonusAmount: 380000, deductions: 15000, totalAmount: 365000, status: 'approved' },
  { id: 'PRM-003', employeeId: 'EMP-103', employeeName: 'Мирзаев Бекзод Т.', period: 'Май 2025', kpiScore: 75, bonusAmount: 280000, deductions: 40000, totalAmount: 240000, status: 'calculated' },
  { id: 'PRM-004', employeeId: 'EMP-104', employeeName: 'Сидорова Нодира А.', period: 'Май 2025', kpiScore: 95, bonusAmount: 520000, deductions: 0, totalAmount: 520000, status: 'paid' },
  { id: 'PRM-005', employeeId: 'EMP-105', employeeName: 'Турсунов Жасур К.', period: 'Май 2025', kpiScore: 60, bonusAmount: 180000, deductions: 55000, totalAmount: 125000, status: 'calculated' },
  { id: 'PRM-006', employeeId: 'EMP-106', employeeName: 'Умарова Зулфия М.', period: 'Апр 2025', kpiScore: 82, bonusAmount: 350000, deductions: 20000, totalAmount: 330000, status: 'paid' },
  { id: 'PRM-007', employeeId: 'EMP-107', employeeName: 'Ахметов Санжар Б.', period: 'Апр 2025', kpiScore: 91, bonusAmount: 440000, deductions: 10000, totalAmount: 430000, status: 'paid' },
  { id: 'PRM-008', employeeId: 'EMP-108', employeeName: 'Исаева Гулнора Х.', period: 'Апр 2025', kpiScore: 78, bonusAmount: 290000, deductions: 30000, totalAmount: 260000, status: 'approved' },
  { id: 'PRM-009', employeeId: 'EMP-109', employeeName: 'Назаров Тимур С.', period: 'Май 2025', kpiScore: 85, bonusAmount: 370000, deductions: 18000, totalAmount: 352000, status: 'calculated' },
  { id: 'PRM-010', employeeId: 'EMP-110', employeeName: 'Касымова Мухаббат Ж.', period: 'Май 2025', kpiScore: 70, bonusAmount: 220000, deductions: 45000, totalAmount: 175000, status: 'calculated' },
];

// ─── Column Definitions ─────────────────────────────────────────

const columns: ColumnDef<PremieRecord>[] = [
  { accessorKey: 'id', header: 'ID', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('id')}</span> },
  { accessorKey: 'employeeName', header: 'Сотрудник', cell: ({ row }) => <span className="font-medium">{row.getValue('employeeName')}</span> },
  { accessorKey: 'period', header: 'Период', cell: ({ row }) => <span className="text-muted-foreground">{row.getValue('period')}</span> },
  {
    accessorKey: 'kpiScore',
    header: 'KPI Score',
    cell: ({ row }) => {
      const score = row.getValue('kpiScore') as number;
      const color = score >= 90 ? 'text-bank-success' : score >= 75 ? 'text-bank-warning' : 'text-bank-red';
      return <span className={`font-semibold ${color}`}>{score}%</span>;
    },
  },
  {
    accessorKey: 'bonusAmount',
    header: 'Бонус',
    cell: ({ row }) => <span className="font-medium">{(row.getValue('bonusAmount') as number).toLocaleString('ru-RU')} ₸</span>,
  },
  {
    accessorKey: 'deductions',
    header: 'Удержания',
    cell: ({ row }) => {
      const d = row.getValue('deductions') as number;
      return d > 0 ? <span className="text-bank-red">−{d.toLocaleString('ru-RU')} ₸</span> : <span className="text-muted-foreground">—</span>;
    },
  },
  {
    accessorKey: 'totalAmount',
    header: 'Итого',
    cell: ({ row }) => <span className="font-bold text-bank-success">{(row.getValue('totalAmount') as number).toLocaleString('ru-RU')} ₸</span>,
  },
  { accessorKey: 'status', header: 'Статус', cell: ({ row }) => <StatusBadge status={row.getValue('status')} /> },
];

// ─── Page Component ─────────────────────────────────────────────

export default function PremiesPage() {
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  const filteredData = mockPremies.filter((r) => {
    if (periodFilter !== 'all' && !r.period.toLowerCase().includes(periodFilter)) return false;
    return true;
  });

  const totalToPay = filteredData
    .filter((r) => r.status !== 'paid')
    .reduce((s, r) => s + r.totalAmount, 0);
  const avgBonus = filteredData.length > 0
    ? Math.round(filteredData.reduce((s, r) => s + r.totalAmount, 0) / filteredData.length)
    : 0;

  return (
    <PageContainer title="Расчёт премий" subtitle="Управление премиями и бонусами сотрудников">
      {/* Summary KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard
          label="Всего к выплате"
          value={`${(totalToPay / 1_000_000).toFixed(1)}M ₸`}
          change="+6,2%"
          icon={Wallet}
          trend="up"
        />
        <KPICard
          label="Средний бонус"
          value={`${(avgBonus / 1_000).toFixed(0)}K ₸`}
          change="+3,8%"
          icon={Calculator}
          trend="up"
        />
        <KPICard
          label="Кол-во сотрудников"
          value={String(filteredData.length)}
          change="0%"
          icon={Users}
          trend="up"
        />
      </div>

      {/* Filter Bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="h-9 w-full sm:w-[180px]">
            <SelectValue placeholder="Период" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все периоды</SelectItem>
            <SelectItem value="май">Май 2025</SelectItem>
            <SelectItem value="апр">Апр 2025</SelectItem>
          </SelectContent>
        </Select>

        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="h-9 w-full sm:w-[220px]">
            <SelectValue placeholder="Филиал" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все филиалы</SelectItem>
            <SelectItem value="almaty">Алматы — Главный</SelectItem>
            <SelectItem value="astana">Астана — Центральный</SelectItem>
            <SelectItem value="shymkent">Шымкент — Южный</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        searchKey="employeeName"
        searchPlaceholder="Поиск по сотруднику..."
        pageSize={10}
      />
    </PageContainer>
  );
}
