'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Download, Plus, Settings2, Trash2, Edit2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

import {
  fetchCashbackSettings,
  addCashbackSetting,
  updateCashbackSetting,
  deleteCashbackSetting,
  CashbackSetting,
} from './services/cashback-settings-service';
import { CashbackRuleFormDialog } from './components/CashbackRuleFormDialog';

export function CashbackSettingsPage() {
  const [settings, setSettings] = useState<CashbackSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CashbackSetting | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCashbackSettings();
      setSettings(data);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось загрузить настройки кешбэка",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddRule = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEditRule = (item: CashbackSetting) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleSaveRule = async (data: CashbackSetting) => {
    try {
      if (editingItem?.ID) {
        await updateCashbackSetting(editingItem.ID, data);
        toast({ title: "Успех", description: "Настройка успешно обновлена" });
      } else {
        await addCashbackSetting(data);
        toast({ title: "Успех", description: "Новая настройка создана" });
      }
      loadData();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить настройку",
        variant: "destructive"
      });
      throw error; // Let the dialog handle the submission state
    }
  };

  const handleDeleteRule = async (id?: number) => {
    if (!id) return;
    if (!window.confirm('Вы уверены, что хотите удалить это правило?')) return;

    try {
      await deleteCashbackSetting(id);
      toast({ title: "Успех", description: "Правило удалено" });
      setSettings(prev => prev.filter(s => (s.ID || s.id) !== id));
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить правило",
        variant: "destructive"
      });
    }
  };

  const toggleActive = async (item: CashbackSetting) => {
    if (!item.ID) return;
    try {
      await updateCashbackSetting(item.ID, { ...item, is_active: !item.is_active });
      setSettings(prev => prev.map(s => s.ID === item.ID ? { ...s, is_active: !s.is_active } : s));
      toast({ title: "Успех", description: "Статус правила изменен" });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось изменить статус",
        variant: "destructive"
      });
    }
  };

  const handleExport = () => {
    const dataToExport = settings.map(s => ({
      'ID': s.ID || s.id,
      'Название правила': s.cashback_name,
      '% Кешбэка': s.cashback_percentage,
      'Номер карты': s.card_number,
      'MCC': s.mcc,
      'Приоритет': s.cashback_priority,
      'Активен': s.is_active ? 'Да' : 'Нет',
      'Дата От': s.from_date,
      'Дата До': s.to_date,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Настройки Кешбэка');
    XLSX.writeFile(workbook, `Cashback_Settings_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredSettings = useMemo(() => {
    if (!searchQuery) return settings;
    const lowerQuery = searchQuery.toLowerCase();
    return settings.filter(s => 
      s.cashback_name?.toLowerCase().includes(lowerQuery) ||
      s.card_number?.toLowerCase().includes(lowerQuery) ||
      s.mcc?.toString().includes(lowerQuery)
    );
  }, [settings, searchQuery]);

  return (
    <PageContainer
      title="Настройки Кешбэка"
      description="Управление правилами и условиями начисления кешбэка"
    >
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
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
            <Button variant="outline" size="icon" disabled={isLoading}>
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={isLoading || settings.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Экспорт
            </Button>
            <Button onClick={handleAddRule} disabled={isLoading}>
              <Plus className="mr-2 h-4 w-4" /> Создать правило
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border overflow-x-auto min-h-[400px] relative">
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="mt-2 text-sm text-muted-foreground">Загрузка данных...</span>
                </div>
              ) : filteredSettings.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                  <p>Нет правил кешбэка</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground sticky top-0">
                    <tr>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">ID</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Название правила</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap text-right">Процент</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Период действия</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap">Номер карты</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap text-center">MCC</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap text-center">Приоритет</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap text-center">Статус</th>
                      <th className="h-12 px-4 font-medium whitespace-nowrap text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSettings.map((rule) => (
                      <tr key={rule.ID || rule.id} className="border-t transition-colors hover:bg-muted/30">
                        <td className="p-4 font-mono text-xs">{rule.ID || rule.id}</td>
                        <td className="p-4 font-medium max-w-[200px] truncate" title={rule.cashback_name}>{rule.cashback_name || '—'}</td>
                        <td className="p-4 text-right">
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400">
                            {rule.cashback_percentage || 0}%
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground text-xs whitespace-nowrap">
                          {rule.from_date || '—'} / {rule.to_date || '—'}
                        </td>
                        <td className="p-4 font-mono text-xs">{rule.card_number || '—'}</td>
                        <td className="p-4 font-mono text-xs text-center">{rule.mcc || '—'}</td>
                        <td className="p-4 text-center">{rule.cashback_priority || 0}</td>
                        <td className="p-4 text-center">
                          <div
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                              rule.is_active
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => toggleActive(rule)}
                          >
                            {rule.is_active ? 'Активен' : 'Отключен'}
                          </div>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <Button variant="ghost" size="icon" onClick={() => handleEditRule(rule)} title="Редактировать">
                            <Edit2 className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.ID)} title="Удалить">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
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

      <CashbackRuleFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={editingItem}
        onSave={handleSaveRule}
      />
    </PageContainer>
  );
}
