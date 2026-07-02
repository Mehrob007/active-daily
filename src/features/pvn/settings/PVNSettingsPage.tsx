'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, Loader2, Plus, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { getPVNSettings, createPVNSetting, updatePVNSetting, PVNSetting } from '../services/pvn-service';
import { PVNSettingModal } from './components/PVNSettingModal';

const currencyMap: Record<number, string> = {
  810: 'RUB',
  840: 'USD',
  978: 'EUR',
  398: 'KZT',
  972: 'TJS',
};

function formatDate(dateString: string | undefined) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('ru-RU');
  } catch {
    return dateString;
  }
}

export function PVNSettingsPage() {
  const [items, setItems] = useState<PVNSetting[]>([]);
  const [loading, setLoading] = useState(true);

  // Sorting
  const [sortField, setSortField] = useState<keyof PVNSetting | 'ID'>('ID');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PVNSetting | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await getPVNSettings();
      setItems(data);
    } catch (err: any) {
      console.error(err);
      toast.error('Ошибка загрузки настроек ПВН');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const sortedItems = useMemo(() => {
    const arr = [...items];
    arr.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const cmp = typeof aVal === 'number' && typeof bVal === 'number'
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal), 'ru', { numeric: true });
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [items, sortField, sortDirection]);

  const handleSort = (field: keyof PVNSetting | 'ID') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    if (sortedItems.length === 0) {
      toast.warning('Нет данных для экспорта');
      return;
    }

    const rows = sortedItems.map((item) => ({
      'ID': item.ID,
      'Дата создания': formatDate(item.CreatedAt),
      'Дата обновления': formatDate(item.UpdatedAt),
      'ID ПВН': item.atm_id,
      'Валюта': currencyMap[item.currency] || item.currency,
      'ИНН кассы': item.cashbox_inn,
      'Наименование кассы': item.cashbox_name,
      'Счёт кассы': item.cashbox_account,
      'ИНН ПВН': item.atm_inn,
      'Наименование ПВН': item.atm_name,
      'Счёт ПВН': item.atm_account,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Настройки ПВН');
    XLSX.writeFile(workbook, `pvn_settings_${new Date().toISOString().slice(0, 10)}.xlsx`);

    toast.success('Экспорт выполнен успешно');
  };

  const validateForm = (data: PVNSetting) => {
    const required: (keyof PVNSetting)[] = [
      'atm_id', 'currency', 'cashbox_inn', 'cashbox_name', 'cashbox_account',
      'atm_inn', 'atm_name', 'atm_account'
    ];
    for (const key of required) {
      if (!data[key] || String(data[key]).trim() === '') {
        return false;
      }
    }
    return true;
  };

  const handleAdd = async (data: PVNSetting) => {
    if (!validateForm(data)) {
      toast.error('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      await createPVNSetting({
        ...data,
        currency: Number(data.currency),
      });
      toast.success('Настройка успешно создана');
      setShowAddModal(false);
      fetchItems();
    } catch (err: any) {
      console.error(err);
      toast.error('Ошибка при создании настройки');
    }
  };

  const handleUpdate = async (id: number, data: PVNSetting) => {
    if (!validateForm(data)) {
      toast.error('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      await updatePVNSetting(id, {
        ...data,
        currency: Number(data.currency),
      });
      toast.success('Настройка успешно обновлена');
      setShowEditModal(false);
      setEditingItem(null);
      fetchItems();
    } catch (err: any) {
      console.error(err);
      toast.error('Ошибка при обновлении настройки');
    }
  };

  const openEdit = (item: PVNSetting) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  return (
    <PageContainer title="Настройки ПВН" description="Управление настройками банкоматов и касс">
      <Card className="p-4 mb-4 flex gap-4 bg-slate-50 border-slate-200 justify-end">
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить настройку
        </Button>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Экспорт в Excel
        </Button>
      </Card>

      <Card className="overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort('ID')}>
                  ID {sortField === 'ID' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('CreatedAt')}>
                  Дата создания {sortField === 'CreatedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('atm_id')}>
                  ID ПВН {sortField === 'atm_id' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('currency')}>
                  Валюта {sortField === 'currency' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('cashbox_inn')}>
                  ИНН кассы {sortField === 'cashbox_inn' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('cashbox_name')}>
                  Наименование кассы {sortField === 'cashbox_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('cashbox_account')}>
                  Счёт кассы {sortField === 'cashbox_account' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('atm_inn')}>
                  ИНН ПВН {sortField === 'atm_inn' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('atm_name')}>
                  Наименование ПВН {sortField === 'atm_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('atm_account')}>
                  Счёт ПВН {sortField === 'atm_account' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Загружаем настройки...
                    </div>
                  </TableCell>
                </TableRow>
              ) : sortedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                    Нет данных для отображения
                  </TableCell>
                </TableRow>
              ) : (
                sortedItems.map((item) => (
                  <TableRow 
                    key={item.ID} 
                    onDoubleClick={() => openEdit(item)}
                    className="cursor-pointer hover:bg-slate-50"
                  >
                    <TableCell className="font-medium">{item.ID}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(item.CreatedAt)}</TableCell>
                    <TableCell>{item.atm_id}</TableCell>
                    <TableCell>{currencyMap[item.currency] || item.currency}</TableCell>
                    <TableCell>{item.cashbox_inn}</TableCell>
                    <TableCell>{item.cashbox_name}</TableCell>
                    <TableCell>{item.cashbox_account}</TableCell>
                    <TableCell>{item.atm_inn}</TableCell>
                    <TableCell>{item.atm_name}</TableCell>
                    <TableCell>{item.atm_account}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(item); }}>
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <PVNSettingModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        data={null}
        onSave={handleAdd}
        onUpdate={handleUpdate}
        isEdit={false}
      />

      <PVNSettingModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        data={editingItem}
        onSave={handleAdd}
        onUpdate={handleUpdate}
        isEdit={true}
      />
    </PageContainer>
  );
}
