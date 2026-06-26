'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { DataTable } from '@/components/banking/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
} from 'lucide-react';
import { applicationsApi } from '@/lib/apiClientApplication';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface ApplicationsPageProps {
  type?: 'card' | 'credit' | 'deposit';
}

export default function ApplicationsPage({ type = 'card' }: ApplicationsPageProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [archive, setArchive] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = '';
      let fetchMethod = applicationsApi.getCards;

      if (type === 'card') {
        endpoint = archive ? '/applications/archive' : '/applications';
        fetchMethod = applicationsApi.getCards;
      } else if (type === 'credit') {
        endpoint = archive ? '/credits/archive' : '/credits';
        fetchMethod = applicationsApi.getCredits;
      } else if (type === 'deposit') {
        endpoint = archive ? '/dipozit/archive' : '/dipozit';
        fetchMethod = applicationsApi.getDeposits;
      }

      const response = await fetchMethod(endpoint);
      setData(Array.isArray(response) ? response : (response as any).data || []);
    } catch (error) {
      console.error('Failed to fetch applications', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить заявки',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [type, archive, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    try {
      if (type === 'card') await applicationsApi.deleteCard(`/applications/${id}`);
      else if (type === 'credit') await applicationsApi.deleteCredit(`/credits/${id}`);
      else if (type === 'deposit') await applicationsApi.deleteDeposit(`/dipozit/${id}`);
      
      toast({ title: 'Успех', description: 'Заявка удалена' });
      fetchData();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Ошибка при удалении', variant: 'destructive' });
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (selectedIds.size === 0) return;
    
    try {
      const ids = Array.from(selectedIds);
      const payload = type === 'card' 
        ? { application_status_id: Number(newStatus) }
        : type === 'credit'
          ? { credit_status_id: Number(newStatus) }
          : { status_id: Number(newStatus) };

      for (const id of ids) {
        if (type === 'card') await applicationsApi.patchCard(`/applications/${id}`, payload);
        else if (type === 'credit') await applicationsApi.patchCredit(`/credits/${id}`, payload);
        else if (type === 'deposit') await applicationsApi.patchDeposit(`/dipozit/${id}`, payload);
      }
      
      toast({ title: 'Успех', description: 'Статус заявок обновлен' });
      setSelectedIds(new Set());
      fetchData();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить статус', variant: 'destructive' });
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(data.map(item => item.ID)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelectRow = (id: number, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) newSet.add(id);
    else newSet.delete(id);
    setSelectedIds(newSet);
  };

  const columns: ColumnDef<any>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={selectedIds.size > 0 && selectedIds.size === data.length}
          onCheckedChange={(val) => toggleSelectAll(!!val)}
          aria-label="Выбрать все"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.has(row.original.ID)}
          onCheckedChange={(val) => toggleSelectRow(row.original.ID, !!val)}
          aria-label="Выбрать строку"
        />
      ),
    },
    { accessorKey: 'ID', header: 'ID', cell: ({ row }) => <span className="font-mono text-xs">{row.getValue('ID')}</span> },
    { 
      id: 'fullName', 
      header: 'Клиент', 
      accessorFn: row => `${row.surname || ''} ${row.name || ''} ${row.patronymic || ''}`.trim(),
      cell: ({ row }) => <span className="font-medium">{row.getValue('fullName')}</span> 
    },
    { accessorKey: 'phone_number', header: 'Телефон' },
    { accessorKey: 'inn', header: 'ИНН' },
    { accessorKey: 'card_name', header: 'Карта/Продукт' },
    { accessorKey: 'delivery_address', header: 'Адрес' },
    {
      id: 'actions',
      header: 'Действия',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push(`/agent/${type}/${row.original.ID}`)}
          >
            <Edit className="h-4 w-4 text-green-600" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleDelete(row.original.ID)}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title={type === 'card' ? 'Заявки на Карты' : type === 'credit' ? 'Заявки на Кредиты' : 'Заявки на Депозиты'}
      subtitle="Управление банковскими заявками"
      actions={
        <Button
          onClick={() => router.push(`/agent/${type}`)}
          className="bg-bank-red hover:bg-bank-red/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Новая заявка
        </Button>
      }
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={statusFilter} onValueChange={(val) => {
          setStatusFilter(val);
          if (selectedIds.size > 0 && val !== 'all') {
            handleStatusUpdate(val);
            setStatusFilter('all');
          }
        }}>
          <SelectTrigger className={`h-9 w-full sm:w-[200px] ${selectedIds.size > 0 ? 'border-bank-red border-2' : ''}`}>
            <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Сменить статус выбранным" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Выберите статус</SelectItem>
            <SelectItem value="1">Новая заявка</SelectItem>
            <SelectItem value="2">В обработке</SelectItem>
            <SelectItem value="3">Одобрено</SelectItem>
            <SelectItem value="4">Отказано</SelectItem>
          </SelectContent>
        </Select>

        <Button variant={archive ? "default" : "outline"} onClick={() => setArchive(!archive)}>
          Архив
        </Button>

        <Button variant="outline" onClick={() => alert('Экспорт в разработке')}>
          <Download className="mr-2 h-4 w-4" />
          Выгрузка
        </Button>

        <div className="flex-1" />

      </div>

      <DataTable
        columns={columns}
        data={data}
        searchKey="fullName"
        searchPlaceholder="Поиск по клиенту..."
        isLoading={loading}
      />
    </PageContainer>
  );
}
