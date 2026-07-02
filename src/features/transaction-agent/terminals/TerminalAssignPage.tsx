'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  getTerminalNames,
  createTerminalName,
  updateTerminalName,
  deleteTerminalName,
  TerminalAssignItem,
} from '../services/terminal-service';

import { getCurrencyCode } from '../utils/currency';
import { TerminalModal } from './components/TerminalModal';

export function TerminalAssignPage() {
  const [data, setData] = useState<TerminalAssignItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    transactionType: '',
    description: '',
    atmId: '',
    currency: '',
  });

  const [sortField, setSortField] = useState<keyof TerminalAssignItem>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<TerminalAssignItem | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getTerminalNames();
      setData(res);
    } catch (err: any) {
      toast.error(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSort = (field: keyof TerminalAssignItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const rowTxType = String(row.transactionType || '').toLowerCase();
      const rowDesc = String(row.description || '').toLowerCase();
      const rowAtmId = String(row.atmId || '').toLowerCase();
      
      const currencyCode = row.currency ? String(row.currency) : '';
      const currencyAlpha = getCurrencyCode(currencyCode).toLowerCase();
      const searchCurrency = filters.currency.toLowerCase();
      
      const currencyMatch = searchCurrency === '' || 
        currencyCode.includes(searchCurrency) || 
        currencyAlpha.includes(searchCurrency);

      return (
        rowTxType.includes(filters.transactionType.toLowerCase()) &&
        rowDesc.includes(filters.description.toLowerCase()) &&
        rowAtmId.includes(filters.atmId.toLowerCase()) &&
        currencyMatch
      );
    });
  }, [data, filters]);

  const sortedData = useMemo(() => {
    const arr = [...filteredData];
    arr.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const cmp = String(aVal).localeCompare(String(bVal), 'ru', { numeric: true });
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filteredData, sortField, sortDirection]);

  const handleSave = async (formData: TerminalAssignItem) => {
    setSaving(true);
    try {
      if (formData.id) {
        await updateTerminalName(formData);
        toast.success('Назначение успешно обновлено');
      } else {
        await createTerminalName(formData);
        toast.success('Назначение успешно создано');
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;
    
    try {
      setLoading(true);
      await deleteTerminalName(id);
      toast.success('Запись удалена');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Ошибка удаления');
      setLoading(false); // only toggle false on error since success calls fetchData which sets loading
    }
  };

  const openCreateModal = () => {
    setEditItem(null);
    setModalOpen(true);
  };

  const openEditModal = (item: TerminalAssignItem) => {
    setEditItem(item);
    setModalOpen(true);
  };

  const formatCurrencyDisplay = (code: string | number | null) => {
    if (!code) return 'Не указана';
    const alpha = getCurrencyCode(code);
    return `${alpha} (${code})`;
  };

  return (
    <PageContainer title="Агент по транзакциям" description="Назначение терминалов">
      <Card className="mt-6 border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-lg font-medium">Список терминалов</CardTitle>
          <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Создать назначение
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              placeholder="Тип транзакции"
              value={filters.transactionType}
              onChange={(e) => handleFilterChange('transactionType', e.target.value)}
            />
            <Input
              placeholder="Описание"
              value={filters.description}
              onChange={(e) => handleFilterChange('description', e.target.value)}
            />
            <Input
              placeholder="ATM ID"
              value={filters.atmId}
              onChange={(e) => handleFilterChange('atmId', e.target.value)}
            />
            <Input
              placeholder="Валюта (код или номер)"
              value={filters.currency}
              onChange={(e) => handleFilterChange('currency', e.target.value)}
            />
          </div>

          <div className="rounded-md border border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('transactionType')} className="font-semibold px-0 hover:bg-transparent">
                      Тип транзакции
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('description')} className="font-semibold px-0 hover:bg-transparent">
                      Описание
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('atmId')} className="font-semibold px-0 hover:bg-transparent">
                      ATM ID
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('currency')} className="font-semibold px-0 hover:bg-transparent">
                      Валюта
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('id')} className="font-semibold px-0 hover:bg-transparent">
                      ID
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex items-center justify-center text-slate-500">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Загрузка...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                      Нет данных
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedData.map((row) => (
                    <TableRow key={row.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-700">{row.transactionType}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{row.atmId}</TableCell>
                      <TableCell>{formatCurrencyDisplay(row.currency)}</TableCell>
                      <TableCell>{row.id}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(row)}
                          className="text-primary hover:text-primary hover:bg-primary/10 mr-1"
                          title="Редактировать"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(row.id!)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <TerminalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={editItem}
        onSave={handleSave}
        loading={saving}
      />
    </PageContainer>
  );
}
