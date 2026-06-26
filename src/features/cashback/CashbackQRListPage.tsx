'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Search, RefreshCw, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export function CashbackQRListPage() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const [items, setItems] = useState([
    {
      id: 'QR-CB-2001',
      date: '2026-06-26 10:15:00',
      amount: '2.50 TJS',
      transactionId: 'TRX-88123901',
      cashbackName: 'QR Оплата 1%',
      senderPhone: '+992 90 000 1122',
      receiverPhone: '+992 98 765 4321',
      receiverName: 'Супермаркет "Ёвар"',
      status: 'Успешно'
    },
    {
      id: 'QR-CB-2002',
      date: '2026-06-26 11:30:45',
      amount: '12.00 TJS',
      transactionId: 'TRX-88124055',
      cashbackName: 'QR Акция Кафе',
      senderPhone: '+992 93 111 2233',
      receiverPhone: '+992 92 333 4455',
      receiverName: 'Кафе "Шоколадница"',
      status: 'Успешно'
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
      title="Кешбэк по QR"
      subtitle="История начисления кешбэка по QR-транзакциям"
    >
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по телефону или транзакции..."
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
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle>История начислений QR</CardTitle>
              <CardDescription>Все транзакции с начисленным кешбэком по QR-платежам</CardDescription>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <QrCode className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="h-12 px-4 font-medium">Дата и время</th>
                    <th className="h-12 px-4 font-medium">Название правила</th>
                    <th className="h-12 px-4 font-medium">Сумма кешбэка</th>
                    <th className="h-12 px-4 font-medium">Отправитель</th>
                    <th className="h-12 px-4 font-medium">Получатель</th>
                    <th className="h-12 px-4 font-medium">ID Транзакции</th>
                    <th className="h-12 px-4 font-medium">Статус</th>
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
                      <td className="p-4 font-mono text-xs">
                        {item.senderPhone}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{item.receiverName}</span>
                          <span className="text-xs text-muted-foreground font-mono">{item.receiverPhone}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs text-muted-foreground">
                        {item.transactionId}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {item.status}
                        </span>
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
