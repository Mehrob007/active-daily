'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Download, Search, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

export function CashbackSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for cashback settings
  const [settings, setSettings] = useState([
    {
      id: 1,
      name: 'Летний Кешбэк 2026',
      percentage: '5.00',
      priority: 1,
      active: true,
      cardType: 'Visa Gold',
      mcc: '5411, 5812',
      fromDate: '2026-06-01',
      toDate: '2026-08-31',
    },
    {
      id: 2,
      name: 'Базовый Корти Милли',
      percentage: '1.00',
      priority: 10,
      active: true,
      cardType: 'Корти Милли',
      mcc: '*',
      fromDate: '2026-01-01',
      toDate: '2026-12-31',
    },
    {
      id: 3,
      name: 'АЗС Спецпредложение',
      percentage: '3.50',
      priority: 2,
      active: false,
      cardType: 'Все',
      mcc: '5541, 5542',
      fromDate: '2026-05-01',
      toDate: '2026-05-31',
    }
  ]);

  const toggleActive = (id: number) => {
    setSettings(settings.map(s => s.id === id ? { ...s, active: !s.active } : s));
    toast.success('Статус правила изменен');
  };

  const handleAddRule = () => {
    toast.info('Форма добавления нового правила кешбэка (в разработке)');
  };

  return (
    <PageContainer
      title="Настройки Кешбэка"
      subtitle="Управление правилами и условиями начисления кешбэка"
    >
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 max-w-sm w-full">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск правил..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="icon">
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Экспорт
            </Button>
            <Button onClick={handleAddRule}>
              <Plus className="mr-2 h-4 w-4" /> Создать правило
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="h-12 px-4 font-medium">Название правила</th>
                    <th className="h-12 px-4 font-medium">Процент (%)</th>
                    <th className="h-12 px-4 font-medium">Период действия</th>
                    <th className="h-12 px-4 font-medium">Типы карт</th>
                    <th className="h-12 px-4 font-medium">MCC коды</th>
                    <th className="h-12 px-4 font-medium text-center">Приоритет</th>
                    <th className="h-12 px-4 font-medium text-center">Статус</th>
                    <th className="h-12 px-4 font-medium text-right">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.map((rule) => (
                    <tr key={rule.id} className="border-t transition-colors hover:bg-muted/30">
                      <td className="p-4 font-medium">{rule.name}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400">
                          {rule.percentage}%
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">
                        {rule.fromDate} — {rule.toDate}
                      </td>
                      <td className="p-4">{rule.cardType}</td>
                      <td className="p-4 font-mono text-xs">{rule.mcc}</td>
                      <td className="p-4 text-center">{rule.priority}</td>
                      <td className="p-4 text-center">
                        <div 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                            rule.active 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                          onClick={() => toggleActive(rule.id)}
                        >
                          {rule.active ? 'Активен' : 'Отключен'}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm">Изменить</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
