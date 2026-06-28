'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Filter, Archive, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const CREDIT_STATUSES = [
  { id: '1', label: 'Новая заявка', color: 'bg-blue-500' },
  { id: '2', label: 'В обработке', color: 'bg-yellow-500' },
  { id: '3', label: 'Одобрено', color: 'bg-green-500' },
  { id: '4', label: 'Отклонено', color: 'bg-red-500' },
];

const MOCK_APPLICATIONS = [
  { id: 1, fullName: 'Иванов Иван Иванович', phone: '+992900112233', loanType: 'Потребительский', amount: 5000, term: 12, inn: '123456789', statusId: '1', createdAt: '2026-06-25T10:00:00Z' },
  { id: 2, fullName: 'Петров Петр Петрович', phone: '+992900223344', loanType: 'Автокредит', amount: 45000, term: 36, inn: '987654321', statusId: '2', createdAt: '2026-06-26T11:30:00Z' },
  { id: 3, fullName: 'Сидорова Анна Сергеевна', phone: '+992900334455', loanType: 'Ипотека', amount: 250000, term: 120, inn: '456123789', statusId: '3', createdAt: '2026-06-27T14:15:00Z' },
];

export function CreditApplicationsListPage() {
  const router = useRouter();
  const [data, setData] = useState(MOCK_APPLICATIONS);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [globalStatusSelect, setGlobalStatusSelect] = useState('');

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(d => d.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить эту заявку?')) {
      setData(prev => prev.filter(item => item.id !== id));
      setSelectedIds(prev => prev.filter(x => x !== id));
      toast.success('Заявка удалена');
    }
  };

  const handleMassStatusUpdate = () => {
    if (!globalStatusSelect) {
      toast.error('Выберите статус для обновления');
      return;
    }
    
    setData(prev => prev.map(item => 
      selectedIds.includes(item.id) ? { ...item, statusId: globalStatusSelect } : item
    ));
    toast.success(`Обновлен статус для ${selectedIds.length} заявок`);
    setSelectedIds([]);
    setGlobalStatusSelect('');
  };

  const handleExport = () => {
    toast.info('Начата выгрузка Excel...');
  };

  const getStatusBadge = (statusId: string) => {
    const status = CREDIT_STATUSES.find(s => s.id === statusId);
    if (!status) return <Badge variant="outline">Неизвестно</Badge>;
    return <Badge className={`${status.color} hover:${status.color} text-white`}>{status.label}</Badge>;
  };

  const filteredData = data.filter(item => 
    item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.phone.includes(searchQuery)
  );

  return (
    <PageContainer
      title="Заявки на кредиты"
      description="Управление заявками на выдачу кредитов"
    >
      <Card>
        <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>Список заявок</CardTitle>
            <CardDescription>Найдено заявок: {filteredData.length}</CardDescription>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              Фильтры
            </Button>
            <Button variant="outline">
              <Archive className="w-4 h-4 mr-2" />
              Архив
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Выгрузка
            </Button>
            <Button onClick={() => router.push('/credit-apps/create')}>
              Новая заявка
            </Button>
          </div>
        </CardHeader>

        {showFilters && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg border">
              <div className="flex-1">
                <Input 
                  placeholder="Поиск по ФИО или телефону..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {selectedIds.length > 0 && (
          <div className="px-6 py-3 bg-blue-50 border-y flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700">
              Выбрано заявок: {selectedIds.length}
            </span>
            <div className="flex items-center gap-2">
              <Select value={globalStatusSelect} onValueChange={setGlobalStatusSelect}>
                <SelectTrigger className="w-[200px] h-8 bg-white">
                  <SelectValue placeholder="Изменить статус..." />
                </SelectTrigger>
                <SelectContent>
                  {CREDIT_STATUSES.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleMassStatusUpdate}>
                Применить
              </Button>
            </div>
          </div>
        )}

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] pl-6">
                    <Checkbox 
                      checked={data.length > 0 && selectedIds.length === data.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>ФИО</TableHead>
                  <TableHead>Телефон</TableHead>
                  <TableHead>Вид кредита</TableHead>
                  <TableHead>Сумма / Срок</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата создания</TableHead>
                  <TableHead className="text-right pr-6">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                      Нет данных для отображения
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map(row => (
                    <TableRow key={row.id}>
                      <TableCell className="pl-6">
                        <Checkbox 
                          checked={selectedIds.includes(row.id)}
                          onCheckedChange={() => toggleSelect(row.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{row.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{row.fullName}</span>
                          <span className="text-xs text-muted-foreground">ИНН: {row.inn}</span>
                        </div>
                      </TableCell>
                      <TableCell>{row.phone}</TableCell>
                      <TableCell>{row.loanType}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{row.amount.toLocaleString()} TJS</span>
                          <span className="text-xs text-muted-foreground">{row.term} мес.</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(row.statusId)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(row.createdAt).toLocaleDateString('ru-RU', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => router.push(`/credit-apps/create?edit=${row.id}`)}>
                            <Edit className="w-4 h-4 text-blue-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
