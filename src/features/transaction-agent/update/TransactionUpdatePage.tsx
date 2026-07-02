'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
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
import { ArrowUpDown, Pencil, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  getTransactions,
  putTransactions,
  putTransactionsNumber,
  TransactionTypeItem,
} from '../services/transaction-agent-service';

import { EditTransactionModal, TRANSACTION_TYPES_OPTIONS } from './components/EditTransactionModal';

export function TransactionUpdatePage() {
  const [data, setData] = useState<TransactionTypeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    type: '',
    name: '',
    number: '',
    id: '',
  });

  // Sorting
  const [sortField, setSortField] = useState<keyof TransactionTypeItem>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modal state
  const [editItem, setEditItem] = useState<TransactionTypeItem | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getTransactions();
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

  const handleSort = (field: keyof TransactionTypeItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const rowType = String(row.type || '').toLowerCase();
      const rowName = String(row.name || '').toLowerCase();
      const rowNumber = String(row.number || '').toLowerCase();
      const rowId = String(row.id || '').toLowerCase();

      return (
        rowType.includes(filters.type.toLowerCase()) &&
        rowName.includes(filters.name.toLowerCase()) &&
        rowNumber.includes(filters.number.toLowerCase()) &&
        rowId.includes(filters.id.toLowerCase())
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

  const handleSave = async (originalItem: TransactionTypeItem, updatedItem: TransactionTypeItem) => {
    setSaving(true);
    try {
      // Check what changed
      const nameChanged = originalItem.name !== updatedItem.name;
      const numberChanged = String(originalItem.number) !== String(updatedItem.number);

      if (nameChanged) {
        await putTransactions(updatedItem);
      }
      
      if (numberChanged) {
        await putTransactionsNumber(updatedItem);
      }

      if (!nameChanged && !numberChanged) {
        toast.info('Нет изменений для сохранения');
        setEditItem(null);
        return;
      }

      toast.success('Транзакция успешно обновлена');
      setEditItem(null);
      fetchData(); // Refresh list to get exact backend state
    } catch (err: any) {
      toast.error(err.message || 'Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const getNumberLabel = (num: string | number) => {
    return TRANSACTION_TYPES_OPTIONS.find((o) => o.value === String(num))?.label || num;
  };

  return (
    <PageContainer title="Агент по транзакциям" description="Обновление типа транзакции">
      <Card className="mt-6 border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              placeholder="Тип транзакции"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            />
            <Input
              placeholder="Название операции"
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
            />
            <Input
              placeholder="Вид операции"
              value={filters.number}
              onChange={(e) => handleFilterChange('number', e.target.value)}
            />
            <Input
              placeholder="ID"
              value={filters.id}
              onChange={(e) => handleFilterChange('id', e.target.value)}
            />
          </div>

          <div className="rounded-md border border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('type')} className="font-semibold px-0 hover:bg-transparent">
                      Тип транзакции
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('name')} className="font-semibold px-0 hover:bg-transparent">
                      Название операции
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('number')} className="font-semibold px-0 hover:bg-transparent">
                      Вид операции
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
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex items-center justify-center text-slate-500">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Загрузка транзакций...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                      Нет данных
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedData.map((row) => (
                    <TableRow key={row.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-700">{row.type}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{getNumberLabel(row.number)}</TableCell>
                      <TableCell>{row.id}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditItem(row)}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Редактировать
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

      <EditTransactionModal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        data={editItem}
        onSave={handleSave}
        loading={saving}
      />
    </PageContainer>
  );
}
