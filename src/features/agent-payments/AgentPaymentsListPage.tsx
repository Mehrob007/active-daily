'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Search, RefreshCw, Plus, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/services/api-client';
import * as XLSX from 'xlsx';
import { PaymentFormDialog } from './PaymentFormDialog';

interface PaymentItem {
  id?: number;
  created_at?: string;
  updated_at?: string;
  cashback_amount?: number;
  beneficiary_idn?: string;
  beneficiary_iban?: string;
  beneficiary_name?: string;
  payment_details?: string;
  payer_idn?: string;
  payer_name?: string;
  payer_iban?: string;
  bic?: string;
}

export function AgentPaymentsListPage() {
  const [items, setItems] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<any>(`${BACKEND_URL}/payments`, { baseURL: '' });
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
      'Дата обновления': formatDateTime(item.updated_at),
      'Сумма перевода': item.cashback_amount,
      'ИНН получателя': item.beneficiary_idn,
      'Счёт получателя': item.beneficiary_iban,
      'Имя получателя': item.beneficiary_name,
      'Детали платежа': item.payment_details,
      'ИНН Отправителя': item.payer_idn,
      'Имя Отправителя': item.payer_name,
      'Счёт Отправителя': item.payer_iban,
      'БИК банка получателя': item.bic || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Платежи');
    XLSX.writeFile(workbook, `Payments_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const lowerQuery = searchQuery.toLowerCase();
    return items.filter(item => 
      item.payer_name?.toLowerCase().includes(lowerQuery) ||
      item.beneficiary_name?.toLowerCase().includes(lowerQuery) ||
      item.payer_idn?.toLowerCase().includes(lowerQuery) ||
      item.beneficiary_idn?.toLowerCase().includes(lowerQuery) ||
      item.payer_iban?.toLowerCase().includes(lowerQuery) ||
      item.beneficiary_iban?.toLowerCase().includes(lowerQuery)
    );
  }, [items, searchQuery]);

  return (
    <PageContainer
      title="Платежи агента"
      description="Просмотр и создание платежей от лица агента"
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
            <Button variant="outline" onClick={fetchItems} disabled={loading} className="flex-1 sm:flex-none">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={loading || items.length === 0} className="flex-1 sm:flex-none">
              <Download className="mr-2 h-4 w-4" /> Экспорт
            </Button>
            <Button onClick={() => setIsAddFormOpen(true)} className="flex-1 sm:flex-none">
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
            <div className="rounded-md border overflow-x-auto min-h-[400px] relative">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="mt-2 text-sm text-muted-foreground">Загрузка данных...</span>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                  <p>Нет платежей</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground sticky top-0">
                    <tr>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">ID / Дата</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Сумма перевода</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Отправитель</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Получатель</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Тип платежа</th>
                      <th className="h-12 px-4 font-medium max-w-[200px] whitespace-nowrap">Детали</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="border-t transition-colors hover:bg-muted/30">
                        <td className="p-4 whitespace-nowrap">
                          <div className="font-medium font-mono">#{item.id}</div>
                          <div className="text-xs text-muted-foreground">{formatDateTime(item.created_at)}</div>
                        </td>
                        <td className="p-4 font-bold whitespace-nowrap">
                          {item.cashback_amount}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col min-w-[150px]">
                            <span className="font-medium truncate max-w-[200px]" title={item.payer_name}>{item.payer_name}</span>
                            <span className="text-xs text-muted-foreground">ИНН: {item.payer_idn}</span>
                            <span className="font-mono text-xs text-muted-foreground">{item.payer_iban}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col min-w-[150px]">
                            <span className="font-medium truncate max-w-[200px]" title={item.beneficiary_name}>{item.beneficiary_name}</span>
                            <span className="text-xs text-muted-foreground">ИНН: {item.beneficiary_idn}</span>
                            <span className="font-mono text-xs text-muted-foreground">{item.beneficiary_iban}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {!item.bic ? (
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
                          <p className="truncate text-xs" title={item.payment_details}>{item.payment_details}</p>
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

      <PaymentFormDialog 
        isOpen={isAddFormOpen} 
        onClose={() => setIsAddFormOpen(false)} 
        onSuccess={fetchItems} 
      />
    </PageContainer>
  );
}
