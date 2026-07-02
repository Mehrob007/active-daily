'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Search, RefreshCw, QrCode, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { apiClient } from '@/services/api-client';

interface QRCashbackItem {
  id?: number;
  created_at?: string;
  amount?: number | string;
  number_in_arm?: string;
  sender_phone?: string;
  payment_id?: string;
  idempotency_key?: string;
  status?: string;
  processed_at?: string;
}

export function CashbackQRListPage() {
  const [items, setItems] = useState<QRCashbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<any>(`${BACKEND_URL}/qr-cashback`, { baseURL: '' });
      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response && Array.isArray(response.data)) {
        data = response.data;
      }
      setItems(data);
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Ошибка загрузки данных',
        variant: 'destructive',
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const formatDateTime = (value?: string) => {
    if (!value) return "—";
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return value;
      return d.toLocaleString("ru-RU");
    } catch {
      return value;
    }
  };

  const handleExport = () => {
    const dataToExport = filteredItems.map(item => ({
      'ID': item.id,
      'Дата создания': formatDateTime(item.created_at),
      'Сумма': item.amount,
      'Номер в ARM': item.number_in_arm,
      'Телефон отправителя': item.sender_phone,
      'ID платежа': item.payment_id,
      'Ключ идемпотентности': item.idempotency_key,
      'Статус': item.status,
      'Дата обработки': formatDateTime(item.processed_at)
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Кэшбэк по QR');
    XLSX.writeFile(workbook, `QR_Cashback_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const lowerQuery = searchQuery.toLowerCase();
    return items.filter(item => 
      item.sender_phone?.toLowerCase().includes(lowerQuery) ||
      item.payment_id?.toLowerCase().includes(lowerQuery) ||
      item.number_in_arm?.toLowerCase().includes(lowerQuery) ||
      item.idempotency_key?.toLowerCase().includes(lowerQuery)
    );
  }, [items, searchQuery]);

  return (
    <PageContainer
      title="Кешбэк по QR"
      description="История начисления кешбэка по QR-транзакциям"
    >
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по телефону, ID платежа, номеру в ARM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchItems} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
            <Button onClick={handleExport} disabled={loading || items.length === 0}>
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
            <div className="rounded-md border overflow-x-auto min-h-[400px] relative">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="mt-2 text-sm text-muted-foreground">Загрузка данных...</span>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                  <p>Нет данных о кешбэке</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground sticky top-0">
                    <tr>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">ID</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Дата создания</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Сумма</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Номер в ARM</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Отправитель</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">ID Транзакции</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Статус</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Ключ идемпотентности</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Дата обработки</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id || item.payment_id || item.idempotency_key} className="border-t transition-colors hover:bg-muted/30">
                        <td className="p-4 whitespace-nowrap text-xs font-mono text-muted-foreground">
                          {item.id || '—'}
                        </td>
                        <td className="p-4 whitespace-nowrap text-xs text-muted-foreground">
                          {formatDateTime(item.created_at)}
                        </td>
                        <td className="p-4 font-bold text-green-600 dark:text-green-500 whitespace-nowrap">
                          +{item.amount || 0}
                        </td>
                        <td className="p-4 font-mono text-xs text-muted-foreground">
                          {item.number_in_arm || '—'}
                        </td>
                        <td className="p-4 font-mono text-xs">
                          {item.sender_phone || '—'}
                        </td>
                        <td className="p-4 font-mono text-xs">
                          {item.payment_id || '—'}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                            ${item.status === 'SUCCESS' || item.status === 'Успешно' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-muted text-muted-foreground'}`
                          }>
                            {item.status || '—'}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-xs max-w-[150px] truncate text-muted-foreground" title={item.idempotency_key}>
                          {item.idempotency_key || '—'}
                        </td>
                        <td className="p-4 whitespace-nowrap text-xs text-muted-foreground">
                          {formatDateTime(item.processed_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
