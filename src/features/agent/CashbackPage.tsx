'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { KPICard } from '@/components/banking';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Settings,
  DollarSign,
  Users,
  Trophy,
  Tag,
  TrendingUp,
} from 'lucide-react';

interface CashbackCategory {
  id: string;
  name: string;
  icon: string;
  percent: number;
  active: boolean;
  spentThisMonth: number;
  limitThisMonth: number;
}

interface CashbackConfig {
  enabled: boolean;
  defaultPercent: number;
  maxMonthlyLimit: number;
}

const mockCategories: CashbackCategory[] = [
  { id: 'cat-1', name: 'Рестораны',      icon: '🍽️', percent: 5.0, active: true,  spentThisMonth: 2450000, limitThisMonth: 5000000 },
  { id: 'cat-2', name: 'Супермаркеты',   icon: '🛒', percent: 3.0, active: true,  spentThisMonth: 4200000, limitThisMonth: 5000000 },
  { id: 'cat-3', name: 'АЗС',             icon: '⛽', percent: 4.0, active: true,  spentThisMonth: 1800000, limitThisMonth: 3000000 },
  { id: 'cat-4', name: 'Онлайн',          icon: '🌐', percent: 2.0, active: true,  spentThisMonth: 3100000, limitThisMonth: 4000000 },
  { id: 'cat-5', name: 'Транспорт',       icon: '🚌', percent: 1.5, active: true,  spentThisMonth: 750000,  limitThisMonth: 2000000 },
  { id: 'cat-6', name: 'Красота',         icon: '💄', percent: 5.0, active: false, spentThisMonth: 0,       limitThisMonth: 1000000 },
  { id: 'cat-7', name: 'Развлечения',     icon: '🎬', percent: 3.0, active: true,  spentThisMonth: 980000,  limitThisMonth: 2000000 },
  { id: 'cat-8', name: 'Аптеки',          icon: '💊', percent: 2.5, active: true,  spentThisMonth: 1200000, limitThisMonth: 2000000 },
];

const totalCashbackPaid = 2_850_000;
const activeUsers = 3_847;
const avgCashbackPerUser = Math.round(totalCashbackPaid / activeUsers);
const topCategory = 'Супермаркеты';

export default function CashbackPage() {
  const [config, setConfig] = useState<CashbackConfig>({
    enabled: true,
    defaultPercent: 2.0,
    maxMonthlyLimit: 50000,
  });

  const [categories, setCategories] = useState<CashbackCategory[]>(mockCategories);

  const toggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const formatAmount = (val: number) => val.toLocaleString('ru-RU');

  return (
    <PageContainer
      title="Кэшбэк"
      subtitle="Программы кэшбэка и вознаграждения"
    >
      {}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Выплачено кэшбэка"
          value={`${(totalCashbackPaid / 1000).toFixed(0)}K ₸`}
          change="+12,3%"
          changeType="positive"
          icon={DollarSign}
        />
        <KPICard
          title="Активные участники"
          value={activeUsers.toLocaleString('ru-RU')}
          change="+8,7%"
          changeType="positive"
          icon={Users}
        />
        <KPICard
          title="Ср. кэшбэк / клиент"
          value={`${formatAmount(avgCashbackPerUser)} ₸`}
          change="+3,2%"
          changeType="positive"
          icon={TrendingUp}
        />
        <KPICard
          title="Топ категория"
          value={topCategory}
          change="3,0%"
          changeType="positive"
          icon={Trophy}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {}
        <Card className="border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-bank-red" />
              <CardTitle className="text-sm font-semibold">Настройки программы</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-6">
            {}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Программа кэшбэка</Label>
                <p className="text-xs text-muted-foreground">
                  Включить или отключить программу кэшбэка для клиентов
                </p>
              </div>
              <Switch
                checked={config.enabled}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, enabled: checked }))
                }
              />
            </div>

            {}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Кэшбэк по умолчанию (%)
              </Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={config.defaultPercent}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    defaultPercent: parseFloat(e.target.value) || 0,
                  }))
                }
                className="h-9 w-full max-w-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Базовый процент для категорий без настраиваемого кэшбэка
              </p>
            </div>

            {}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Максимальный кэшбэк в месяц (₸)
              </Label>
              <Input
                type="number"
                step="1000"
                min="0"
                value={config.maxMonthlyLimit}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    maxMonthlyLimit: parseInt(e.target.value) || 0,
                  }))
                }
                className="h-9 w-full max-w-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Максимальная сумма кэшбэка для одного клиента в месяц
              </p>
            </div>
          </CardContent>
        </Card>

        {}
        <Card className="border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-bank-red" />
              <CardTitle className="text-sm font-semibold">
                Лимиты по категориям (текущий месяц)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="max-h-[320px] overflow-y-auto space-y-5">
              {categories
                .filter((c) => c.active)
                .map((cat) => {
                  const pct = Math.min(
                    (cat.spentThisMonth / cat.limitThisMonth) * 100,
                    100
                  );
                  const remaining = cat.limitThisMonth - cat.spentThisMonth;
                  return (
                    <div key={cat.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center gap-1.5">
                          <span>{cat.icon}</span>
                          {cat.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatAmount(cat.spentThisMonth)} / {formatAmount(cat.limitThisMonth)} ₸
                        </span>
                      </div>
                      <Progress value={pct} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Осталось: {formatAmount(remaining > 0 ? remaining : 0)} ₸
                        {pct >= 90 && pct < 100 && (
                          <span className="ml-2 text-bank-warning font-medium">
                            Скоро исчерпан
                          </span>
                        )}
                        {pct >= 100 && (
                          <span className="ml-2 text-bank-red font-medium">
                            Лимит исчерпан
                          </span>
                        )}
                      </p>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      <Card className="mt-6 border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-bank-red" />
            <CardTitle className="text-sm font-semibold">Категории кэшбэка</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/40 backdrop-blur-sm z-10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    Категория
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground text-center">
                    Кэшбэк %
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground text-center">
                    Потрачено (мес.)
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground text-center">
                    Лимит (мес.)
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground text-right">
                    Активна
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{cat.icon}</span>
                        <span className="font-medium text-sm">{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`font-semibold border ${
                          cat.active
                            ? 'bg-bank-red/10 text-bank-red border-bank-red/20'
                            : 'bg-muted text-muted-foreground border-border/60'
                        }`}
                      >
                        {cat.percent}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center tabular-nums text-sm">
                      {formatAmount(cat.spentThisMonth)} ₸
                    </TableCell>
                    <TableCell className="text-center tabular-nums text-sm">
                      {formatAmount(cat.limitThisMonth)} ₸
                    </TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={cat.active}
                        onCheckedChange={() => toggleCategory(cat.id)}
                      />
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
