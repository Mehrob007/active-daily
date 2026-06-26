'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Search, RefreshCw, Plus } from 'lucide-react';
import { toast } from 'sonner';

export function AgentPaymentsListPage() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const [items, setItems] = useState([
    {
      id: 1001,
      createdAt: '2026-06-26 10:15:00',
      updatedAt: '2026-06-26 10:15:00',
      amount: '1500.00',
      beneficiaryIdn: '123456789',
      beneficiaryIban: '20202972000000012345',
      beneficiaryName: 'ООО Ромашка',
      paymentDetails: 'Оплата за услуги',
      payerIdn: '987654321',
      payerName: 'ИП Иванов И.И.',
      payerIban: '20202972000000098765',
      bic: '350101800',
      type: 'domestic'
    },
    {
      id: 1002,
      createdAt: '2026-06-26 11:30:45',
      updatedAt: '2026-06-26 11:30:45',
      amount: '500.00',
      beneficiaryIdn: '112233445',
      beneficiaryIban: '20202972000000011223',
      beneficiaryName: 'ЗАО Вектор',
      paymentDetails: 'Возврат средств',
      payerIdn: '554433221',
      payerName: 'Ахмедов А.А.',
      payerIban: '20202972000000055443',
      bic: '',
      type: 'internal'
    }
  ]);

  const refreshData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Данные обновлены');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = () => {
    toast.info('Открытие формы создания платежа (в разработке)');
  };

  return (
    <PageContainer
      title="Платежи агента"
      subtitle="Просмотр и создание платежей от лица агента"
    >
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по имени, ИНН или счету..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={refreshData} disabled={loading} className="flex-1 sm:flex-none">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Download className="mr-2 h-4 w-4" /> Экспорт
            </Button>
            <Button onClick={handleAddPayment} className="flex-1 sm:flex-none">
              <Plus className="mr-2 h-4 w-4" /> Создать платеж
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Список платежей</CardTitle>
            <CardDescription>Внутренние и межбанковские переводы</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="h-12 px-4 font-medium">ID / Дата</th>
                    <th className="h-12 px-4 font-medium">Сумма перевода</th>
                    <th className="h-12 px-4 font-medium">Отправитель</th>
                    <th className="h-12 px-4 font-medium">Получатель</th>
                    <th className="h-12 px-4 font-medium">Тип платежа</th>
                    <th className="h-12 px-4 font-medium max-w-[200px]">Детали</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t transition-colors hover:bg-muted/30">
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-medium">#{item.id}</div>
                        <div className="text-xs text-muted-foreground">{item.createdAt}</div>
                      </td>
                      <td className="p-4 font-bold whitespace-nowrap">
                        {item.amount}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-medium truncate max-w-[200px]" title={item.payerName}>{item.payerName}</span>
                          <span className="text-xs text-muted-foreground">ИНН: {item.payerIdn}</span>
                          <span className="font-mono text-xs text-muted-foreground">{item.payerIban}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-medium truncate max-w-[200px]" title={item.beneficiaryName}>{item.beneficiaryName}</span>
                          <span className="text-xs text-muted-foreground">ИНН: {item.beneficiaryIdn}</span>
                          <span className="font-mono text-xs text-muted-foreground">{item.beneficiaryIban}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {item.type === 'internal' ? (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            Внутренний
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1 items-start">
                            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                              Внешний (БИК)
                            </span>
                            <span className="text-xs font-mono text-muted-foreground">БИК: {item.bic}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 max-w-[200px]">
                        <p className="truncate text-xs" title={item.paymentDetails}>{item.paymentDetails}</p>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="h-24 text-center text-muted-foreground">
                        Нет данных
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
