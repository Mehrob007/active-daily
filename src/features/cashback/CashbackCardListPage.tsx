'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Search, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { apiClient } from '@/services/api-client';

const getCurrencyCode = (code: string) => {
  const codeMap: Record<string, string> = {
    "972": "TJS",
    "840": "USD",
    "978": "EUR",
    "810": "RUB",
    "643": "RUB",
    "156": "CNY",
    "826": "GBP",
  };
  return codeMap[code] || code;
};

interface CardCashbackItem {
  ID?: number;
  id?: number;
  created_at?: string;
  amount?: number;
  currency?: number | string;
  utrno?: string;
  cashback_name?: string;
  card_number?: string;
  card_id?: string;
  account_number?: string;
  atm_id?: string;
  terminal_address?: string;
}

export function CashbackCardListPage() {
  const [items, setItems] = useState<CardCashbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<any>(`${BACKEND_URL}/card-cashback`, { baseURL: '' });
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
      'ID': item.ID || item.id,
      'Дата создания': formatDateTime(item.created_at),
      'Сумма кэшбэка': `${item.amount || 0} ${getCurrencyCode(String(item.currency || ''))}`,
      'UTRNO': item.utrno,
      'Название кэшбэка': item.cashback_name,
      'Номер карты': item.card_number,
      'ID карты': item.card_id,
      'Номер счёта': item.account_number,
      'ID банкомата': item.atm_id,
      'Адрес терминала': item.terminal_address,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Кэшбэк по картам');
    XLSX.writeFile(workbook, `Card_Cashback_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const lowerQuery = searchQuery.toLowerCase();
    return items.filter(item => 
      item.card_number?.toLowerCase().includes(lowerQuery) ||
      item.cashback_name?.toLowerCase().includes(lowerQuery) ||
      item.utrno?.toLowerCase().includes(lowerQuery) ||
      item.account_number?.toLowerCase().includes(lowerQuery)
    );
  }, [items, searchQuery]);

  return (
    <PageContainer
      title="Кешбэк по картам"
      description="История начисления кешбэка по карточным транзакциям"
    >
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по карте, UTRNO, счету..."
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
          <CardHeader className="pb-2">
            <CardTitle>История начислений</CardTitle>
            <CardDescription>Все транзакции с начисленным кешбэком</CardDescription>
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
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Дата и время</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Название правила</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Сумма кешбэка</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Номер карты</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Счет</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">UTRNO</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Терминал</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.ID || item.id || item.utrno} className="border-t transition-colors hover:bg-muted/30">
                        <td className="p-4 whitespace-nowrap text-xs font-mono text-muted-foreground">
                          {item.ID || item.id || '—'}
                        </td>
                        <td className="p-4 whitespace-nowrap text-xs text-muted-foreground">
                          {formatDateTime(item.created_at)}
                        </td>
                        <td className="p-4 font-medium max-w-[200px] truncate" title={item.cashback_name}>
                          {item.cashback_name || '—'}
                        </td>
                        <td className="p-4 font-bold text-green-600 dark:text-green-500 whitespace-nowrap">
                          +{item.amount || 0} <span className="text-xs font-normal opacity-80">{getCurrencyCode(String(item.currency || ''))}</span>
                        </td>
                        <td className="p-4 font-mono">
                          <div className="flex flex-col">
                            <span>{item.card_number || '—'}</span>
                            <span className="text-xs text-muted-foreground">ID: {item.card_id || '—'}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-xs text-muted-foreground">
                          {item.account_number || '—'}
                        </td>
                        <td className="p-4 font-mono text-xs">
                          {item.utrno || '—'}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col max-w-[250px]">
                            <span className="truncate" title={item.terminal_address}>{item.terminal_address || '—'}</span>
                            <span className="text-xs text-muted-foreground">{item.atm_id || '—'}</span>
                          </div>
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
