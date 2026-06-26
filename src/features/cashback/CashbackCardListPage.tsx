'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function CashbackCardListPage() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const [items, setItems] = useState([
    {
      id: 'CB-1001',
      date: '2026-06-26 14:30:00',
      amount: '15.50 TJS',
      utrno: '891023912301',
      cashbackName: 'Летний Кешбэк 2026',
      cardNumber: '4314 **** **** 1234',
      cardId: '123456',
      accountNumber: '20202972000000012345',
      atmId: 'ATM-992',
      terminalAddress: 'г. Душанбе, ул. Рудаки 15'
    },
    {
      id: 'CB-1002',
      date: '2026-06-26 15:45:22',
      amount: '5.00 TJS',
      utrno: '891023912344',
      cashbackName: 'Базовый Корти Милли',
      cardNumber: '5048 **** **** 5678',
      cardId: '654321',
      accountNumber: '20202972000000098765',
      atmId: 'ATM-445',
      terminalAddress: 'г. Худжанд, ул. Ленина 10'
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

  return (
    <PageContainer
      title="Кешбэк по картам"
      subtitle="История начисления кешбэка по карточным транзакциям"
    >
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по карте, ID или UTRNO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshData} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" /> Экспорт
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>История начислений</CardTitle>
            <CardDescription>Все транзакции с начисленным кешбэком</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="h-12 px-4 font-medium">Дата и время</th>
                    <th className="h-12 px-4 font-medium">Название правила</th>
                    <th className="h-12 px-4 font-medium">Сумма кешбэка</th>
                    <th className="h-12 px-4 font-medium">Номер карты</th>
                    <th className="h-12 px-4 font-medium">Счет</th>
                    <th className="h-12 px-4 font-medium">UTRNO</th>
                    <th className="h-12 px-4 font-medium">Терминал</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t transition-colors hover:bg-muted/30">
                      <td className="p-4 whitespace-nowrap text-xs text-muted-foreground">
                        {item.date}
                      </td>
                      <td className="p-4 font-medium">
                        {item.cashbackName}
                      </td>
                      <td className="p-4 font-bold text-green-600 dark:text-green-500 whitespace-nowrap">
                        +{item.amount}
                      </td>
                      <td className="p-4 font-mono">
                        <div className="flex flex-col">
                          <span>{item.cardNumber}</span>
                          <span className="text-xs text-muted-foreground">ID: {item.cardId}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs text-muted-foreground">
                        {item.accountNumber}
                      </td>
                      <td className="p-4 font-mono text-xs">
                        {item.utrno}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col max-w-[200px]">
                          <span className="truncate" title={item.terminalAddress}>{item.terminalAddress}</span>
                          <span className="text-xs text-muted-foreground">{item.atmId}</span>
                        </div>
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
